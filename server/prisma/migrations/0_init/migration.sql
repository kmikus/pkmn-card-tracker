-- CreateTable
CREATE TABLE "collection" (
    "id" TEXT NOT NULL,
    "userid" TEXT NOT NULL,
    "name" TEXT,
    "setname" TEXT,
    "image" TEXT,
    "data" TEXT,

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id","userid")
);

-- CreateTable
CREATE TABLE "test_table" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "displayname" TEXT,
    "email" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_userid_fkey" FOREIGN KEY ("userid") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

