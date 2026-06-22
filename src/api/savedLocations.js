import { supabase } from "../lib/supabase";

export const saveUserLocation = async ({ userId, city, latitude, longitude }) => {
  if (!supabase || !userId) return;

  const { error } = await supabase
    .from("saved_locations")
    .upsert(
      {
        user_id: userId,
        city,
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id,latitude,longitude" }
    );

  if (error) throw error;
};
