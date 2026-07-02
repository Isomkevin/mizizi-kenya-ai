pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/poseidon.circom";

// Mizizi ZK Credit Rails
//
// Public signal order (fixed — prover, contract, TypeScript must match):
//   0: farmerCommitment
//   1: tier          (1=Excellent .. 4=High risk)
//   2: rawScore      (0–100)
//   3: minScore
//   4: minTier

template CreditTier() {
    signal input phoneHash;
    signal input salt;
    signal input repaymentsOnTime[6];
    signal input monthlyInflowKes[6];

    signal input farmerCommitment;
    signal input tier;
    signal input rawScore;
    signal input minScore;
    signal input minTier;

    component poseidon = Poseidon(2);
    poseidon.inputs[0] <== phoneHash;
    poseidon.inputs[1] <== salt;
    farmerCommitment === poseidon.out;

    signal onTimeCount;
    onTimeCount <== repaymentsOnTime[0] + repaymentsOnTime[1] + repaymentsOnTime[2]
        + repaymentsOnTime[3] + repaymentsOnTime[4] + repaymentsOnTime[5];

    signal repaymentScore;
    repaymentScore <== onTimeCount * 100 / 6;

    signal turnoverSum;
    turnoverSum <== monthlyInflowKes[0] + monthlyInflowKes[1] + monthlyInflowKes[2]
        + monthlyInflowKes[3] + monthlyInflowKes[4] + monthlyInflowKes[5];

    signal turnoverRatio;
    turnoverRatio <== turnoverSum * 100;

    signal turnoverScore;
    component capCheck = LessThan(32);
    capCheck.in[0] <== turnoverRatio;
    capCheck.in[1] <== 12000000;
    turnoverScore <== capCheck.out * (turnoverRatio / 120000) + (1 - capCheck.out) * 100;

    signal computedRawScore;
    computedRawScore <== repaymentScore * 70 / 100 + turnoverScore * 30 / 100;
    rawScore === computedRawScore;

    // Tier band constraints (tier is public)
    component eqT1 = IsEqual();
    eqT1.in[0] <== tier;
    eqT1.in[1] <== 1;
    component ge80 = GreaterEqThan(8);
    ge80.in[0] <== rawScore;
    ge80.in[1] <== 80;
    eqT1.out * (1 - ge80.out) === 0;

    component eqT2 = IsEqual();
    eqT2.in[0] <== tier;
    eqT2.in[1] <== 2;
    component ge60 = GreaterEqThan(8);
    ge60.in[0] <== rawScore;
    ge60.in[1] <== 60;
    component lt80 = LessThan(8);
    lt80.in[0] <== rawScore;
    lt80.in[1] <== 80;
    eqT2.out * (1 - ge60.out) === 0;
    eqT2.out * (1 - lt80.out) === 0;

    component eqT3 = IsEqual();
    eqT3.in[0] <== tier;
    eqT3.in[1] <== 3;
    component ge40 = GreaterEqThan(8);
    ge40.in[0] <== rawScore;
    ge40.in[1] <== 40;
    component lt60 = LessThan(8);
    lt60.in[0] <== rawScore;
    lt60.in[1] <== 60;
    eqT3.out * (1 - ge40.out) === 0;
    eqT3.out * (1 - lt60.out) === 0;

    component eqT4 = IsEqual();
    eqT4.in[0] <== tier;
    eqT4.in[1] <== 4;
    component lt40 = LessThan(8);
    lt40.in[0] <== rawScore;
    lt40.in[1] <== 40;
    eqT4.out * (1 - lt40.out) === 0;

    component scoreOk = GreaterEqThan(8);
    scoreOk.in[0] <== rawScore;
    scoreOk.in[1] <== minScore;
    scoreOk.out === 1;

    component tierOk = LessEqThan(8);
    tierOk.in[0] <== tier;
    tierOk.in[1] <== minTier;
    tierOk.out === 1;

    for (var i = 0; i < 6; i++) {
        repaymentsOnTime[i] * (repaymentsOnTime[i] - 1) === 0;
    }
}

component main { public [farmerCommitment, tier, rawScore, minScore, minTier] } = CreditTier();
