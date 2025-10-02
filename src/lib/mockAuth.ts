// Mock authentication for development when Firebase is not available
export const mockUsers = [
  {
    uid: "mock-admin-uid",
    email: "admin@espacobellas.com",
    password: "123456",
    displayName: "Administrador",
    profile: {
      name: "Administrador",
      role: "admin" as const,
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
    },
  },
  {
    uid: "mock-professional-uid",
    email: "ana@espacobellas.com",
    password: "123456",
    displayName: "Ana Silva",
    profile: {
      name: "Ana Silva",
      role: "professional" as const,
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
    },
  },
  {
    uid: "mock-receptionist-uid",
    email: "julia@espacobellas.com",
    password: "123456",
    displayName: "Júlia Santos",
    profile: {
      name: "Júlia Santos",
      role: "receptionist" as const,
      createdAt: new Date("2024-01-01"),
      lastLogin: new Date(),
    },
  },
];

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
}

export interface MockUserCredential {
  user: MockUser;
}

export const mockSignInWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<MockUserCredential> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const user = mockUsers.find(
    (u) => u.email === email && u.password === password,
  );

  if (!user) {
    throw new Error("auth/invalid-credential");
  }

  return {
    user: {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    },
  };
};

export const mockSignOut = async (): Promise<void> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return Promise.resolve();
};

export const mockOnAuthStateChanged = (
  callback: (user: MockUser | null) => void,
) => {
  // Check for stored user in localStorage immediately
  const checkAuthState = () => {
    const storedUser = localStorage.getItem("mockAuthUser");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        callback(user);
      } catch (error) {
        localStorage.removeItem("mockAuthUser");
        callback(null);
      }
    } else {
      callback(null);
    }
  };

  // Check immediately without delay
  checkAuthState();

  // Return unsubscribe function
  return () => {};
};

// Helper to store/remove mock user
export const setMockAuthUser = (user: MockUser | null) => {
  if (user) {
    localStorage.setItem("mockAuthUser", JSON.stringify(user));
  } else {
    localStorage.removeItem("mockAuthUser");
  }
};
