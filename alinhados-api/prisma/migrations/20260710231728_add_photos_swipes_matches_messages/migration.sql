-- CreateEnum
CREATE TYPE "swipe_direction" AS ENUM ('like', 'dislike');

-- CreateTable
CREATE TABLE "photos" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "ordem" INTEGER,
    "is_avatar" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "swipes" (
    "id" UUID NOT NULL,
    "swiper_id" UUID NOT NULL,
    "swiped_id" UUID NOT NULL,
    "direction" "swipe_direction" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "swipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" UUID NOT NULL,
    "profile_a_id" UUID NOT NULL,
    "profile_b_id" UUID NOT NULL,
    "deu_certo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "match_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "photos_profile_id_idx" ON "photos"("profile_id");

-- CreateIndex
CREATE INDEX "swipes_swiped_id_idx" ON "swipes"("swiped_id");

-- CreateIndex
CREATE UNIQUE INDEX "swipes_swiper_id_swiped_id_key" ON "swipes"("swiper_id", "swiped_id");

-- CreateIndex
CREATE INDEX "matches_profile_b_id_idx" ON "matches"("profile_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_profile_a_id_profile_b_id_key" ON "matches"("profile_a_id", "profile_b_id");

-- CreateIndex
CREATE INDEX "messages_match_id_idx" ON "messages"("match_id");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_swiper_id_fkey" FOREIGN KEY ("swiper_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "swipes" ADD CONSTRAINT "swipes_swiped_id_fkey" FOREIGN KEY ("swiped_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_a_id_fkey" FOREIGN KEY ("profile_a_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_b_id_fkey" FOREIGN KEY ("profile_b_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
