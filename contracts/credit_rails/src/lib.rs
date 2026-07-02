#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, BytesN, Env, Symbol,
};

const VALIDITY_SECONDS: u64 = 90 * 24 * 60 * 60;

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Credential(BytesN<32>),
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
    /// Issue a ZK credit credential after off-chain Groth16 verification.
    /// Public signals are passed on-chain; proof_hash binds the verified proof bytes.
    pub fn issue_credential(
        env: Env,
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
