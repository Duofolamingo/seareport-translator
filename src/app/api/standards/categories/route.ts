import { ok } from "@/lib/api";

export async function GET() {
  return ok({
    productCategories: [
      { value: "ELECTRONICS", label: "电子电器" },
      { value: "TEXTILE", label: "纺织品" },
      { value: "TOY", label: "玩具" },
      { value: "FOOD", label: "食品接触" },
      { value: "COSMETICS", label: "化妆品" },
      { value: "BUILDING", label: "建材" },
      { value: "FOOTWEAR", label: "鞋类" },
      { value: "OTHER", label: "其他" },
    ],
    countries: [
      { value: "THAILAND", label: "泰国", flag: "🇹🇭" },
      { value: "VIETNAM", label: "越南", flag: "🇻🇳" },
      { value: "INDONESIA", label: "印度尼西亚", flag: "🇮🇩" },
      { value: "MALAYSIA", label: "马来西亚", flag: "🇲🇾" },
      { value: "PHILIPPINES", label: "菲律宾", flag: "🇵🇭" },
      { value: "CAMBODIA", label: "柬埔寨", flag: "🇰🇭" },
      { value: "MYANMAR", label: "缅甸", flag: "🇲🇲" },
      { value: "LAOS", label: "老挝", flag: "🇱🇦" },
    ],
  });
}
