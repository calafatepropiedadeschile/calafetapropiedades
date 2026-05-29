-- CreateIndex
CREATE INDEX "Property_published_featured_createdAt_idx" ON "Property"("published", "featured", "createdAt");

-- CreateIndex
CREATE INDEX "Property_published_type_priceType_idx" ON "Property"("published", "type", "priceType");

-- CreateIndex
CREATE INDEX "Property_published_zone_idx" ON "Property"("published", "zone");

-- CreateIndex
CREATE INDEX "Property_published_price_idx" ON "Property"("published", "price");

-- CreateIndex
CREATE INDEX "Property_published_bedrooms_idx" ON "Property"("published", "bedrooms");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_propertyId_idx" ON "Lead"("propertyId");
