// SeaReport Translator - 数据库种子数据（SQLite 版）
// 运行: npx tsx prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STANDARDS = [
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "THAILAND", targetStandard: "TIS 223", targetName: "Textiles - Safety Requirements", productCategory: "TEXTILE", notes: "限值要求基本一致" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全 第1部分：通用要求", targetCountry: "THAILAND", targetStandard: "TIS 60335-1", targetName: "Household Electrical Safety", productCategory: "ELECTRONICS", notes: "基于 IEC 60335-1" },
  { gbStandard: "GB 6675.1-2014", gbName: "玩具安全 第1部分：基本规范", targetCountry: "THAILAND", targetStandard: "TIS 685", targetName: "Toy Safety Requirements", productCategory: "TOY", notes: "机械物理性能要求" },
  { gbStandard: "GB 4806.1-2016", gbName: "食品接触材料通用安全要求", targetCountry: "THAILAND", targetStandard: "Thai FDA Notification", targetName: "Food Contact Materials", productCategory: "FOOD", notes: "泰国 FDA 具体规定" },
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "VIETNAM", targetStandard: "TCVN 5838", targetName: "Textile Safety Standards", productCategory: "TEXTILE", notes: "参照 GB 标准制定" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全", targetCountry: "VIETNAM", targetStandard: "TCVN 5699", targetName: "Electrical Appliance Safety", productCategory: "ELECTRONICS", notes: "基于 IEC 标准" },
  { gbStandard: "GB 6675.1-2014", gbName: "玩具安全", targetCountry: "VIETNAM", targetStandard: "TCVN 6238", targetName: "Toy Safety", productCategory: "TOY", notes: "参照 EN 71" },
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "INDONESIA", targetStandard: "SNI 0293", targetName: "Textile Product Safety", productCategory: "TEXTILE", notes: "印尼国家标准" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全", targetCountry: "INDONESIA", targetStandard: "SNI IEC 60335-1", targetName: "Household Electrical Safety", productCategory: "ELECTRONICS", notes: "直接采用 IEC 标准" },
  { gbStandard: "GB 6675.1-2014", gbName: "玩具安全", targetCountry: "INDONESIA", targetStandard: "SNI 8126", targetName: "Toy Safety Standard", productCategory: "TOY", notes: "参照 ISO 8124" },
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "MALAYSIA", targetStandard: "MS ISO 3758", targetName: "Textile Safety", productCategory: "TEXTILE", notes: "马来西亚标准" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全", targetCountry: "MALAYSIA", targetStandard: "MS IEC 60335-1", targetName: "Electrical Safety", productCategory: "ELECTRONICS", notes: "采用 IEC 标准" },
  { gbStandard: "GB 6675.1-2014", gbName: "玩具安全", targetCountry: "MALAYSIA", targetStandard: "MS EN 71", targetName: "Toy Safety", productCategory: "TOY", notes: "采用 EN 71" },
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "PHILIPPINES", targetStandard: "PNS 63", targetName: "Textile Standards", productCategory: "TEXTILE", notes: "菲律宾国家标准" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全", targetCountry: "PHILIPPINES", targetStandard: "PNS IEC 60335-1", targetName: "Electrical Safety", productCategory: "ELECTRONICS", notes: "基于 IEC 标准" },
  { gbStandard: "GB 6675.1-2014", gbName: "玩具安全", targetCountry: "PHILIPPINES", targetStandard: "PNS 182", targetName: "Toy Safety", productCategory: "TOY", notes: "菲律宾玩具标准" },
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "CAMBODIA", targetStandard: "ISC Textile 001", targetName: "Textile Safety Standard", productCategory: "TEXTILE", notes: "柬埔寨标准体系建设中" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全", targetCountry: "CAMBODIA", targetStandard: "ISC Electrical 001", targetName: "Electrical Safety", productCategory: "ELECTRONICS", notes: "参照 TISI 标准" },
  { gbStandard: "GB 18401-2010", gbName: "国家纺织产品基本安全技术规范", targetCountry: "MYANMAR", targetStandard: "MNT Textile 001", targetName: "Textile Safety", productCategory: "TEXTILE", notes: "缅甸标准体系" },
  { gbStandard: "GB 4706.1-2005", gbName: "家用和类似用途电器的安全", targetCountry: "MYANMAR", targetStandard: "MNT Electrical 001", targetName: "Electrical Safety", productCategory: "ELECTRONICS", notes: "参照国际标准" },
];

const TERMS = [
  { chinese: "甲醛含量", thai: "ปริมาณฟอร์มัลดีไฮด์", vietnamese: "Hàm lượng formaldehyde", indonesian: "Kandungan formaldehida", malay: "Kandungan formaldehid", category: "TEST_ITEM" },
  { chinese: "pH值", thai: "ค่า pH", vietnamese: "Giá trị pH", indonesian: "Nilai pH", malay: "Nilai pH", category: "TEST_ITEM" },
  { chinese: "色牢度", thai: "ความทนของสี", vietnamese: "Độ bền màu", indonesian: "Ketahanan warna", malay: "Ketahanan warna", category: "TEST_ITEM" },
  { chinese: "纤维含量", thai: "ปริมาณเส้นใย", vietnamese: "Thành phần sợi", indonesian: "Kandungan serat", malay: "Kandungan gentian", category: "TEST_ITEM" },
  { chinese: "电气强度", thai: "ความแข็งแรงทางไฟฟ้า", vietnamese: "Cường độ điện", indonesian: "Kekuatan listrik", malay: "Kekuatan elektrik", category: "TEST_ITEM" },
  { chinese: "接地电阻", thai: "ความต้านทานกราวน์", vietnamese: "Điện trở tiếp địa", indonesian: "Resistansi grounding", malay: "Rintangan pentanahan", category: "TEST_ITEM" },
  { chinese: "泄漏电流", thai: "กระแสไฟรั่ว", vietnamese: "Dòng rò", indonesian: "Arus bocor", malay: "Arus bocor", category: "TEST_ITEM" },
  { chinese: "合格", thai: "ผ่าน", vietnamese: "Đạt", indonesian: "Lulus", malay: "Lulus", category: "CONCLUSION" },
  { chinese: "不合格", thai: "ไม่ผ่าน", vietnamese: "Không đạt", indonesian: "Tidak lulus", malay: "Gagal", category: "CONCLUSION" },
  { chinese: "气相色谱法", thai: "Gas chromatography", vietnamese: "Sắc ký khí", indonesian: "Kromatografi gas", malay: "Kromatografi gas", category: "TEST_METHOD" },
  { chinese: "原子吸收光谱法", thai: "AAS", vietnamese: "Phương pháp quang phổ hấp thụ nguyên tử", indonesian: "Spektroskopi serapan atom", malay: "Spektroskopi serapan atom", category: "TEST_METHOD" },
  { chinese: "检测报告", thai: "รายงานการทดสอบ", vietnamese: "Báo cáo kiểm tra", indonesian: "Laporan pengujian", malay: "Laporan ujian", category: "GENERAL" },
  { chinese: "检测项目", thai: "รายการทดสอบ", vietnamese: "Hạng mục kiểm tra", indonesian: "Item pengujian", malay: "Item ujian", category: "GENERAL" },
  { chinese: "检测结果", thai: "ผลการทดสอบ", vietnamese: "Kết quả kiểm tra", indonesian: "Hasil pengujian", malay: "Keputusan ujian", category: "GENERAL" },
  { chinese: "备注", thai: "หมายเหตุ", vietnamese: "Ghi chú", indonesian: "Catatan", malay: "Catatan", category: "GENERAL" },
];

async function main() {
  console.log("🌱 开始种子数据导入...");

  // 1. 创建管理员账号
  const adminPhone = "13800000000";
  const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        phone: adminPhone,
        password: bcrypt.hashSync("admin123456", 10),
        name: "系统管理员",
        role: "ADMIN",
      },
    });
    console.log("✅ 创建管理员账号: 13800000000 / admin123456");
  }

  // 2. 创建演示用户
  const demoPhone = "13900000000";
  const existingDemo = await prisma.user.findUnique({ where: { phone: demoPhone } });
  if (!existingDemo) {
    await prisma.user.create({
      data: {
        phone: demoPhone,
        password: bcrypt.hashSync("demo123456", 10),
        name: "演示用户",
        company: "XX 跨境电商有限公司",
        role: "USER",
      },
    });
    console.log("✅ 创建演示用户: 13900000000 / demo123456");
  }

  // 3. 导入标准映射
  console.log(`📚 导入 ${STANDARDS.length} 条标准映射...`);
  for (const std of STANDARDS) {
    await prisma.standardMapping.upsert({
      where: {
        gbStandard_targetCountry_productCategory: {
          gbStandard: std.gbStandard,
          targetCountry: std.targetCountry,
          productCategory: std.productCategory,
        },
      },
      create: std,
      update: std,
    });
  }

  // 4. 导入术语
  console.log(`📖 导入 ${TERMS.length} 条术语...`);
  for (const term of TERMS) {
    await prisma.term.upsert({
      where: {
        chinese_category: { chinese: term.chinese, category: term.category },
      },
      create: term,
      update: term,
    });
  }

  console.log("✨ 种子数据导入完成！");
  console.log("\n📌 测试账号：");
  console.log("   管理员: 13800000000 / admin123456");
  console.log("   演示用户: 13900000000 / demo123456");
}

main()
  .catch((e) => {
    console.error("❌ 种子数据导入失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });