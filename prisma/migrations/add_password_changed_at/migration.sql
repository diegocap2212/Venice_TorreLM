-- AddColumn password_changed_at to User
ALTER TABLE "User" ADD COLUMN "password_changed_at" TIMESTAMP(3);
