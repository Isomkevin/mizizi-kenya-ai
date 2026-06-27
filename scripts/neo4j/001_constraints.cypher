// Mizizi graph constraints — run before seeding Neo4j data.

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

CREATE CONSTRAINT document_id_unique IF NOT EXISTS
FOR (n:Document)
REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT farm_parcel_id_unique IF NOT EXISTS
FOR (n:FarmParcel)
REQUIRE n.id IS UNIQUE;

CREATE CONSTRAINT data_source_id_unique IF NOT EXISTS
FOR (n:DataSource)
REQUIRE n.id IS UNIQUE;
