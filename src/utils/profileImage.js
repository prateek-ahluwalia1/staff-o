import { apiURL } from "./exports";

const cleanPath = (value) =>
  String(value || "")
    .trim()
    .replace(/^\/+/, "");

export const getProfileImageFromUserdata = (userdata) => {
  return (
    userdata?.data?.profile_image ||
    userdata?.profile_image ||
    userdata?.data?.staff?.profile_image ||
    userdata?.staff?.profile_image ||
    userdata?.data?.contractor?.profile_image ||
    userdata?.contractor?.profile_image ||
    userdata?.data?.customer?.profile_image ||
    userdata?.customer?.profile_image ||
    null
  );
};

export const resolveProfileImageUrl = (profileImage) => {
  if (!profileImage) return null;

  if (String(profileImage).startsWith("http")) {
    return profileImage;
  }

  const normalizedPath = cleanPath(profileImage);
  if (!normalizedPath) return null;

  const pathWithStorage = normalizedPath.startsWith("storage/")
    ? normalizedPath
    : `storage/${normalizedPath}`;

  return `${apiURL}${pathWithStorage}`;
};

export const getProfileImageUrlFromUserdata = (userdata) => {
  return resolveProfileImageUrl(getProfileImageFromUserdata(userdata));
};
