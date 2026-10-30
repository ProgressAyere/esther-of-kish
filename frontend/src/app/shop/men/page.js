import ShopCatalog from "@/components/shop/ShopCatalog";

export const metadata = {
  title: "Men | Esther Of Kish",
  description: "Handcrafted bead chains, stretch bracelets, studs, rings and sets for men.",
};

export default function MenShopPage() {
  return <ShopCatalog gender="men" />;
}
