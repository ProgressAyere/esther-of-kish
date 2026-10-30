import ShopCatalog from "@/components/shop/ShopCatalog";

export const metadata = {
  title: "Women | Esther Of Kish",
  description: "Handcrafted bead necklaces, bracelets, earrings, rings and sets for women.",
};

export default function WomenShopPage() {
  return <ShopCatalog gender="women" />;
}
