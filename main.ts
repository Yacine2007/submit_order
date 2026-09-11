import { MongoClient, ObjectId } from "npm:mongodb@6.3.0";

// ============================================================
// Environment
// ============================================================
const MONGODB_URI = Deno.env.get("MONGODB_URI") || "";
const IMGBB_API_KEY = Deno.env.get("IMGBB_API_KEY") || "";
const ORDERS_DB_NAME = Deno.env.get("ORDERS_DB_NAME") || "bypro_orders";
const SETTINGS_DB_NAME = Deno.env.get("SETTINGS_DB_NAME") || "DashboardDB";
const ORDERS_COLLECTION = "orders";
const SETTINGS_COLLECTION = "settings";
const SETTINGS_KEY = "service_settings";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing from environment variables");
}
if (!IMGBB_API_KEY) {
  console.error("IMGBB_API_KEY is missing from environment variables");
}

// ============================================================
// Default settings (used only when DB has no document yet)
// ============================================================
const DEFAULT_SETTINGS = {
  categories: [
    { id: "design", enabled: true, services: [
      { id: "logos", enabled: true, label_ar: "شعارات", label_en: "Logos" },
      { id: "brand_identity", enabled: true, label_ar: "هوية بصرية", label_en: "Brand Identity" },
      { id: "photo_editing", enabled: true, label_ar: "تعديل صور", label_en: "Photo Editing" },
      { id: "social_media", enabled: true, label_ar: "سوشيال ميديا", label_en: "Social Media" },
      { id: "advertising", enabled: true, label_ar: "إعلانية", label_en: "Advertising" },
      { id: "business_cards", enabled: true, label_ar: "بطاقات", label_en: "Business Cards" },
      { id: "posts", enabled: true, label_ar: "منشورات", label_en: "Posts" },
      { id: "covers", enabled: true, label_ar: "أغلفة", label_en: "Covers" },
      { id: "personal_profile", enabled: true, label_ar: "بروفايل شخصي", label_en: "Personal Profile" },
      { id: "company_profile", enabled: true, label_ar: "بروفايل شركة", label_en: "Company Profile" },
    ]},
    { id: "web", enabled: true, services: [
      { id: "landing_page", enabled: true, label_ar: "صفحة هبوط", label_en: "Landing Page" },
      { id: "ecommerce", enabled: true, label_ar: "متجر إلكتروني", label_en: "E-commerce" },
      { id: "static_site", enabled: true, label_ar: "موقع ثابت", label_en: "Static Website" },
      { id: "dynamic_site", enabled: true, label_ar: "موقع ديناميكي", label_en: "Dynamic Website" },
      { id: "blog", enabled: true, label_ar: "مدونة", label_en: "Blog" },
      { id: "corporate", enabled: true, label_ar: "تعريفي", label_en: "Corporate" },
      { id: "portfolio", enabled: true, label_ar: "Portfolio", label_en: "Portfolio" },
      { id: "dashboard", enabled: true, label_ar: "لوحة تحكم", label_en: "Dashboard" },
      { id: "education_platform", enabled: true, label_ar: "منصة تعليمية", label_en: "Education Platform" },
    ]},
    { id: "apps", enabled: true, services: [
      { id: "android", enabled: true, label_ar: "أندرويد", label_en: "Android" },
      { id: "ios", enabled: true, label_ar: "iOS", label_en: "iOS" },
      { id: "web_app", enabled: true, label_ar: "ويب App", label_en: "Web App" },
      { id: "cross_platform", enabled: true, label_ar: "متعدد المنصات", label_en: "Cross-platform" },
      { id: "flutter", enabled: true, label_ar: "Flutter", label_en: "Flutter" },
      { id: "react_native", enabled: true, label_ar: "React Native", label_en: "React Native" },
    ]},
    { id: "desktop", enabled: true, services: [
      { id: "windows", enabled: true, label_ar: "ويندوز", label_en: "Windows" },
      { id: "macos", enabled: true, label_ar: "ماك", label_en: "macOS" },
      { id: "linux", enabled: true, label_ar: "لينكس", label_en: "Linux" },
      { id: "cross_desktop", enabled: true, label_ar: "متعدد الأنظمة", label_en: "Cross-platform" },
      { id: "management", enabled: true, label_ar: "إدارة", label_en: "Management" },
      { id: "pos", enabled: true, label_ar: "POS", label_en: "POS" },
    ]},
    { id: "systems", enabled: true, services: [
      { id: "cms", enabled: true, label_ar: "CMS", label_en: "CMS" },
      { id: "custom_script", enabled: true, label_ar: "سكربت مخصص", label_en: "Custom Script" },
      { id: "python_scripts", enabled: true, label_ar: "بايثون ولغات أخرى", label_en: "Python Scripts" },
      { id: "erp", enabled: true, label_ar: "ERP", label_en: "ERP" },
      { id: "crm", enabled: true, label_ar: "CRM", label_en: "CRM" },
      { id: "billing", enabled: true, label_ar: "فوترة", label_en: "Billing" },
      { id: "booking", enabled: true, label_ar: "حجوزات", label_en: "Booking" },
      { id: "bots", enabled: true, label_ar: "بوتات", label_en: "Bots" },
      { id: "automation", enabled: true, label_ar: "أتمتة", label_en: "Automation" },
    ]},
    { id: "editing", enabled: true, services: [
      { id: "video_editing", enabled: true, label_ar: "مونتاج فيديو", label_en: "Video Editing" },
      { id: "voiceover", enabled: true, label_ar: "تعليق صوتي", label_en: "Voice-over" },
      { id: "audio_editing", enabled: true, label_ar: "تحرير صوتي", label_en: "Audio Editing" },
      { id: "motion_graphics", enabled: true, label_ar: "موشن جرافيك", label_en: "Motion Graphics" },
      { id: "video_ads", enabled: true, label_ar: "إعلانات فيديو", label_en: "Video Ads" },
      { id: "youtube", enabled: true, label_ar: "يوتيوب", label_en: "YouTube" },
      { id: "reels", enabled: true, label_ar: "ريلز", label_en: "Reels/TikTok" },
      { id: "ai_videos", enabled: true, label_ar: "AI فيديو", label_en: "AI Videos" },
    ]},
    { id: "security", enabled: true, services: [
      { id: "pen_testing", enabled: true, label_ar: "اختبار اختراق", label_en: "Pen Testing" },
      { id: "website_security", enabled: true, label_ar: "حماية مواقع", label_en: "Website Security" },
      { id: "vulnerability", enabled: true, label_ar: "تحليل ثغرات", label_en: "Vulnerability Analysis" },
      { id: "consulting", enabled: true, label_ar: "استشارات", label_en: "Consulting" },
      { id: "audit", enabled: true, label_ar: "تدقيق", label_en: "Audit" },
      { id: "app_protection", enabled: true, label_ar: "حماية تطبيقات", label_en: "App Protection" },
      { id: "reports", enabled: true, label_ar: "تقارير", label_en: "Reports" },
      { id: "incident_response", enabled: true, label_ar: "استجابة", label_en: "Incident Response" },
    ]},
    { id: "marketing", enabled: true, services: [
      { id: "digital_marketing", enabled: true, label_ar: "تسويق رقمي", label_en: "Digital Marketing" },
      { id: "paid_ads", enabled: true, label_ar: "إعلانات", label_en: "Paid Ads" },
      { id: "seo", enabled: true, label_ar: "SEO", label_en: "SEO" },
      { id: "content_marketing", enabled: true, label_ar: "محتوى", label_en: "Content Marketing" },
      { id: "campaigns", enabled: true, label_ar: "حملات", label_en: "Campaigns" },
      { id: "social_media_management", enabled: true, label_ar: "سوشيال ميديا", label_en: "Social Media Management" },
    ]},
    { id: "other", enabled: true, services: [
      { id: "custom_service", enabled: true, label_ar: "خدمة مخصصة", label_en: "Custom Service" },
    ]},
  ]
};

// ============================================================
// MongoDB connection (single client, two databases)
// ============================================================
let cachedClient: MongoClient | null = null;
let cachedOrdersDb: any = null;
let cachedSettingsDb: any = null;

async function getClient(): Promise<MongoClient> {
  if (cachedClient) return cachedClient;
  if (!MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  const client = new MongoClient(MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  });
  await client.connect();
  cachedClient = client;
  return client;
}

async function getOrdersDb() {
  if (cachedOrdersDb) return cachedOrdersDb;
  const client = await getClient();
  cachedOrdersDb = client.db(ORDERS_DB_NAME);
  return cachedOrdersDb;
}

async function getSettingsDb() {
  if (cachedSettingsDb) return cachedSettingsDb;
  const client = await getClient();
  cachedSettingsDb = client.db(SETTINGS_DB_NAME);
  return cachedSettingsDb;
}

// ============================================================
// Helpers
// ============================================================
function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function htmlResponse(html: string, status = 200) {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

// ============================================================
// Router
// ============================================================
async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;

  // ---- CORS preflight ----
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // ---- Static HTML pages ----
  if (method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
    try {
      const html = await Deno.readTextFile("./index.html");
      return htmlResponse(html);
    } catch {
      return new Response("index.html not found", { status: 404 });
    }
  }

  if (method === "GET" && url.pathname === "/dashboard") {
    try {
      const html = await Deno.readTextFile("./brmjli.html");
      return htmlResponse(html);
    } catch {
      return new Response("brmjli.html not found", { status: 404 });
    }
  }

  // ---- API ----
  try {
    // ============================================================
    // SERVICE SETTINGS  (shared with Flask: DashboardDB.settings)
    // document shape: { key: "service_settings", value: { categories: [...] } }
    // ============================================================
    if (method === "GET" && url.pathname === "/get_service_settings") {
      try {
        const sdb = await getSettingsDb();
        const doc = await sdb.collection(SETTINGS_COLLECTION).findOne({ key: SETTINGS_KEY });
        if (doc && doc.value && Array.isArray(doc.value.categories)) {
          return jsonResponse({ status: "success", settings: doc.value });
        }
        // No doc in DB → return defaults (without writing, to keep DB authoritative)
        return jsonResponse({ status: "success", settings: DEFAULT_SETTINGS });
      } catch (e) {
        console.error("get_service_settings error:", errorMessage(e));
        // On failure, still return defaults so the form works
        return jsonResponse({ status: "success", settings: DEFAULT_SETTINGS });
      }
    }

    if (method === "POST" && url.pathname === "/update_service_settings") {
      const data = await req.json();
      const settings = data.settings || data;
      const sdb = await getSettingsDb();
      await sdb.collection(SETTINGS_COLLECTION).updateOne(
        { key: SETTINGS_KEY },
        { $set: { value: settings, updated_at: new Date().toISOString() } },
        { upsert: true }
      );
      return jsonResponse({ status: "success" });
    }

    // ============================================================
    // ORDERS  (bypro_orders.orders)
    // ============================================================
    if (method === "POST" && url.pathname === "/submit_order") {
      const odb = await getOrdersDb();
      const order = await req.json();
      order.createdAt = new Date().toISOString();
      order.status = "pending";
      order.isNew = true;
      const result = await odb.collection(ORDERS_COLLECTION).insertOne(order);
      return jsonResponse({ status: "success", id: String(result.insertedId) });
    }

    if (method === "GET" && url.pathname === "/get_orders") {
      const odb = await getOrdersDb();
      const allOrders = await odb.collection(ORDERS_COLLECTION)
        .find()
        .sort({ createdAt: -1 })
        .toArray();
      return jsonResponse({ status: "success", orders: allOrders });
    }

    if (method === "POST" && url.pathname === "/update_order_status") {
      const odb = await getOrdersDb();
      const { id, status } = await req.json();
      if (!id || !status) return jsonResponse({ status: "error", error: "id and status are required" }, 400);
      let oid: ObjectId;
      try {
        oid = new ObjectId(id);
      } catch {
        return jsonResponse({ status: "error", error: "invalid order id" }, 400);
      }
      await odb.collection(ORDERS_COLLECTION).updateOne({ _id: oid }, { $set: { status } });
      return jsonResponse({ status: "success" });
    }

    if (method === "POST" && url.pathname === "/delete_order") {
      const odb = await getOrdersDb();
      const { id } = await req.json();
      if (!id) return jsonResponse({ status: "error", error: "id is required" }, 400);
      let oid: ObjectId;
      try {
        oid = new ObjectId(id);
      } catch {
        return jsonResponse({ status: "error", error: "invalid order id" }, 400);
      }
      await odb.collection(ORDERS_COLLECTION).deleteOne({ _id: oid });
      return jsonResponse({ status: "success" });
    }

    if (method === "POST" && url.pathname === "/mark_order_read") {
      const odb = await getOrdersDb();
      const { id } = await req.json();
      if (!id) return jsonResponse({ status: "error", error: "id is required" }, 400);
      let oid: ObjectId;
      try {
        oid = new ObjectId(id);
      } catch {
        return jsonResponse({ status: "error", error: "invalid order id" }, 400);
      }
      await odb.collection(ORDERS_COLLECTION).updateOne({ _id: oid }, { $set: { isNew: false } });
      return jsonResponse({ status: "success" });
    }

    if (method === "POST" && url.pathname === "/mark_all_read") {
      const odb = await getOrdersDb();
      await odb.collection(ORDERS_COLLECTION).updateMany({ isNew: true }, { $set: { isNew: false } });
      return jsonResponse({ status: "success" });
    }

    // ============================================================
    // IMAGE UPLOAD (ImgBB)
    // ============================================================
    if (method === "POST" && url.pathname === "/upload_images") {
      if (!IMGBB_API_KEY) {
        return jsonResponse({ status: "success", urls: [], warning: "IMGBB_API_KEY not configured" });
      }
      const formData = await req.formData();
      const files = formData.getAll("images");
      const urls: string[] = [];
      for (const file of files) {
        if (file instanceof File) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);
            let binary = "";
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            const base64 = btoa(binary);
            const imgbbRes = await fetch("https://api.imgbb.com/1/upload", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ key: IMGBB_API_KEY, image: base64 }).toString(),
            });
            const result = await imgbbRes.json();
            if (result.success && result.data && result.data.url) {
              urls.push(result.data.url);
            } else {
              console.warn("ImgBB upload failed:", result);
            }
          } catch (e) {
            console.warn("Image upload error:", errorMessage(e));
          }
        }
      }
      return jsonResponse({ status: "success", urls });
    }
  } catch (e) {
    const msg = errorMessage(e);
    console.error("Handler error:", msg);
    return jsonResponse({ status: "error", error: msg }, 500);
  }

  return new Response("Not Found", { status: 404 });
}

export default { fetch: handleRequest };
