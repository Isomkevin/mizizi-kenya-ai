#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, BytesN, Env, Symbol,
    crypto::bls12_381::{Fr, G1Affine, G2Affine},
    vec, Vec,
};

const VALIDITY_SECONDS: u64 = 90 * 24 * 60 * 60;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Credential(BytesN<32>),
    VerificationKey,
}

#[derive(Clone)]
#[contracttype]
pub struct G1Point {
    pub x: BytesN<48>,
    pub y: BytesN<48>,
}

#[derive(Clone)]
#[contracttype]
pub struct G2Point {
    pub x1: BytesN<48>,
    pub x2: BytesN<48>,
    pub y1: BytesN<48>,
    pub y2: BytesN<48>,
}

#[derive(Clone)]
#[contracttype]
pub struct VerificationKey {
    pub alpha: G1Point,
    pub beta: G2Point,
    pub gamma: G2Point,
    pub delta: G2Point,
    pub ic: Vec<G1Point>,
}

#[derive(Clone)]
#[contracttype]
pub struct Proof {
    pub a: G1Point,
    pub b: G2Point,
    pub c: G1Point,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Credential {
    pub farmer_commitment: BytesN<32>,
    pub tier: u32,
    pub raw_score: u32,
    pub max_usdc: i128,
    pub valid_until: u64,
    pub issued_at: u64,
    pub proof_hash: BytesN<32>,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum Error {
    InvalidTier = 1,
    InvalidScore = 2,
    Expired = 3,
    DrawdownExceedsLimit = 4,
    InsufficientBalance = 5,
    MalformedVerifyingKey = 6,
    InvalidProof = 7,
    VkNotSet = 8,
}

fn max_usdc_for_tier(tier: u32) -> i128 {
    match tier {
        1 => 500,
        2 => 300,
        3 => 150,
        _ => 0,
    }
}

fn tier_matches_score(tier: u32, raw_score: u32) -> bool {
    match tier {
        1 => raw_score >= 80,
        2 => raw_score >= 60 && raw_score < 80,
        3 => raw_score >= 40 && raw_score < 60,
        4 => raw_score < 40,
        _ => false,
    }
}

#[contract]
pub struct CreditRails;

#[contractimpl]
impl CreditRails {
    pub fn init_vk(env: Env, vk: VerificationKey) {
        env.storage().instance().set(&DataKey::VerificationKey, &vk);
    }

    fn g1_from_point(env: &Env, p: &G1Point) -> G1Affine {
        use ark_ff::PrimeField;
        use ark_serialize::CanonicalSerialize;
        let x = ark_bls12_381::Fq::from_be_bytes_mod_order(&p.x.to_array());
        let y = ark_bls12_381::Fq::from_be_bytes_mod_order(&p.y.to_array());
        let ark_g1 = ark_bls12_381::G1Affine::new(x, y);
        let mut buf = [0u8; 96];
        ark_g1.serialize_uncompressed(&mut buf[..]).unwrap();
        G1Affine::from_array(env, &buf)
    }

    fn g2_from_point(env: &Env, p: &G2Point) -> G2Affine {
        use ark_ff::PrimeField;
        use ark_serialize::CanonicalSerialize;
        let x1 = ark_bls12_381::Fq::from_be_bytes_mod_order(&p.x1.to_array());
        let x2 = ark_bls12_381::Fq::from_be_bytes_mod_order(&p.x2.to_array());
        let y1 = ark_bls12_381::Fq::from_be_bytes_mod_order(&p.y1.to_array());
        let y2 = ark_bls12_381::Fq::from_be_bytes_mod_order(&p.y2.to_array());
        let x = ark_bls12_381::Fq2::new(x1, x2);
        let y = ark_bls12_381::Fq2::new(y1, y2);
        let ark_g2 = ark_bls12_381::G2Affine::new(x, y);
        let mut buf = [0u8; 192];
        ark_g2.serialize_uncompressed(&mut buf[..]).unwrap();
        G2Affine::from_array(env, &buf)
    }

    /// Issue a ZK credit credential after off-chain Groth16 verification.
    pub fn issue_credential(
        env: Env,
        proof: Proof,
        public_signals: Vec<Fr>,
        farmer_commitment: BytesN<32>,
        tier: u32,
        raw_score: u32,
        min_score: u32,
        min_tier: u32,
        proof_hash: BytesN<32>,
    ) -> Result<Credential, Error> {
        if tier < 1 || tier > 4 {
            return Err(Error::InvalidTier);
        }
        if !tier_matches_score(tier, raw_score) {
            return Err(Error::InvalidTier);
        }
        if raw_score < min_score {
            return Err(Error::InvalidScore);
        }
        if tier > min_tier {
            return Err(Error::InvalidTier);
        }

        let vk: VerificationKey = env
            .storage()
            .instance()
            .get(&DataKey::VerificationKey)
            .ok_or(Error::VkNotSet)?;

        let bls = env.crypto().bls12_381();
        if public_signals.len() + 1 != vk.ic.len() as usize {
            return Err(Error::MalformedVerifyingKey);
        }
        
        let mut vk_x = Self::g1_from_point(&env, &vk.ic.get(0).unwrap());
        for (s, v_point) in public_signals.iter().zip(vk.ic.iter().skip(1)) {
            let v = Self::g1_from_point(&env, &v_point);
            let prod = bls.g1_mul(&v, &s);
            vk_x = bls.g1_add(&vk_x, &prod);
        }

        let a = Self::g1_from_point(&env, &proof.a);
        let b = Self::g2_from_point(&env, &proof.b);
        let c = Self::g1_from_point(&env, &proof.c);
        let alpha = Self::g1_from_point(&env, &vk.alpha);
        let beta = Self::g2_from_point(&env, &vk.beta);
        let gamma = Self::g2_from_point(&env, &vk.gamma);
        let delta = Self::g2_from_point(&env, &vk.delta);

        let neg_a = -a;
        let vp1 = vec![&env, neg_a, alpha, vk_x, c];
        let vp2 = vec![&env, b, beta, gamma, delta];

        if !bls.pairing_check(vp1, vp2) {
            return Err(Error::InvalidProof);
        }

        let now = env.ledger().timestamp();
        let credential = Credential {
            farmer_commitment: farmer_commitment.clone(),
            tier,
            raw_score,
            max_usdc: max_usdc_for_tier(tier),
            valid_until: now + VALIDITY_SECONDS,
            issued_at: now,
            proof_hash,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Credential(farmer_commitment.clone()), &credential);

        env.events().publish(
            (symbol_short!("issued"), farmer_commitment),
            (tier, raw_score, credential.max_usdc),
        );

        Ok(credential)
    }

    pub fn get_credential(env: Env, farmer_commitment: BytesN<32>) -> Option<Credential> {
        env.storage()
            .persistent()
            .get(&DataKey::Credential(farmer_commitment))
    }

    /// Simulate USDC drawdown up to credential max (P1 — records intent on-chain).
    pub fn drawdown(
        env: Env,
        farmer_commitment: BytesN<32>,
        amount: i128,
    ) -> Result<i128, Error> {
        let credential = Self::get_credential(env.clone(), farmer_commitment)
            .ok_or(Error::InvalidScore)?;
        let now = env.ledger().timestamp();
        if now > credential.valid_until {
            return Err(Error::Expired);
        }
        if amount <= 0 || amount > credential.max_usdc {
            return Err(Error::DrawdownExceedsLimit);
        }

        env.events().publish(
            (Symbol::new(&env, "drawdown"), credential.farmer_commitment),
            amount,
        );

        Ok(amount)
    }
}
