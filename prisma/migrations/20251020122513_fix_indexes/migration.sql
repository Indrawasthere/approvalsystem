/*
  Warnings:

  - The values [APPROVAL_COMPLETED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `revisionHistory` on table `approvals` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('APPROVAL_REQUEST', 'APPROVAL_APPROVED', 'APPROVAL_REJECTED', 'NEEDS_REVISION', 'LAYER_READY');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterTable
ALTER TABLE "approvals" ALTER COLUMN "revisionHistory" SET NOT NULL;

-- CreateIndex
CREATE INDEX "approvals_firstLayerApproverId_idx" ON "approvals"("firstLayerApproverId");

-- CreateIndex
CREATE INDEX "approvals_secondLayerApproverId_idx" ON "approvals"("secondLayerApproverId");

-- CreateIndex
CREATE INDEX "approvals_thirdLayerApproverId_idx" ON "approvals"("thirdLayerApproverId");
