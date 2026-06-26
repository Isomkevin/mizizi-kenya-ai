// Mizizi Phase 0 constraints
CREATE CONSTRAINT farmer_id_unique IF NOT EXISTS
FOR (n:Farmer)
REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT cooperative_id_unique IF NOT EXISTS
FOR (n:Cooperative)
REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT loan_id_unique IF NOT EXISTS
FOR (n:Loan)
REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT input_dealer_id_unique IF NOT EXISTS
FOR (n:InputDealer)
REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT climate_zone_id_unique IF NOT EXISTS
FOR (n:ClimateZone)
REQUIRE n.id IS UNIQUE;
