export const normalizeAuthResponse = (response) => {
  if (!response) return null;

  const token = response.token;

  if (!token) return null;

  let user = null;

  if (response.data?.user) {
    user = response.data.user;
  } else if (response.user) {
    user = response.user;
  } else if (response.data) {
    user = response.data;
  }

  if (user && !user.id && user.data?.id) {
    user.id = user.data.id;
  }

  if (user && !user.id && !user.data?.id) {
    console.warn("User object missing ID in all expected locations:", user);
  }

  return {
    token,
    user,
  };
};

export const extractUserId = (userData) => {
  if (!userData) return null;

  return userData.data?.id || userData.id || userData.user?.id;
};

export const getUserType = (userData) => {
  if (!userData) return null;

  return userData.data?.user_type || userData.user_type;
};
