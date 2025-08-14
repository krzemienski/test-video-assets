// Test script to verify Supabase connection and check database contents
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log("=== Supabase Connection Test ===")
console.log("URL:", supabaseUrl)
console.log("Key available:", !!supabaseKey)

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    // Test basic connection
    console.log("\n=== Testing Connection ===")
    const { data, error } = await supabase.from("video_assets").select("count", { count: "exact", head: true })

    if (error) {
      console.error("Connection error:", error)
      return
    }

    console.log("Connection successful!")
    console.log("Total rows in video_assets:", data)

    // Get sample data
    console.log("\n=== Sample Data ===")
    const { data: sampleData, error: sampleError } = await supabase.from("video_assets").select("*").limit(3)

    if (sampleError) {
      console.error("Sample data error:", sampleError)
    } else {
      console.log("Sample assets:", sampleData)
    }

    // Check facet_counts table
    console.log("\n=== Facet Counts ===")
    const { data: facetData, error: facetError } = await supabase.from("facet_counts").select("*").limit(10)

    if (facetError) {
      console.error("Facet counts error:", facetError)
    } else {
      console.log("Sample facet counts:", facetData)
    }
  } catch (err) {
    console.error("Test failed:", err)
  }
}

testConnection()
