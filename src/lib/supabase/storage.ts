import { createBrowserSupabaseClient } from "./client";

const BUCKET = "product-images";

/**
 * Uploads a workspace image to Supabase Storage.
 * Images are stored under product-images/{userId}/{folder}/{randomId}.{ext}
 * Returns the signed URL valid for 1 year (365 days).
 *
 * @param folder - Subfolder within the user directory, e.g. "products" or "devices"
 */
export async function uploadProductImage(file: File, userId: string, folder = "products"): Promise<string> {
  const supabase = createBrowserSupabaseClient();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data, error: urlError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365); // 1 year

  if (urlError || !data?.signedUrl) {
    throw new Error(urlError?.message ?? "Failed to get image URL.");
  }

  return data.signedUrl;
}

/**
 * Deletes a product image from Supabase Storage using its signed URL.
 * Extracts the storage path from the URL and removes the object.
 */
export async function deleteProductImage(signedUrl: string): Promise<void> {
  try {
    const supabase = createBrowserSupabaseClient();
    // Extract the path portion after /object/sign/product-images/
    const match = signedUrl.match(/\/object\/sign\/product-images\/([^?]+)/);
    if (!match) return;
    const path = decodeURIComponent(match[1]);
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Non-critical: log but don't throw if image delete fails
    console.warn("Could not delete product image from storage.");
  }
}
