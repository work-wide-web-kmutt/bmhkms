type StaffAvailability = "online" | "away" | "busy" | "offline";
type StaffStatus = "active" | "inactive";

interface StaffDirectorySeedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface StaffDirectoryRow extends StaffDirectorySeedUser {
  availability: StaffAvailability;
  company: string;
  joined: string;
  role: string;
  status: StaffStatus;
}

const staffDirectorySeedUsers: StaffDirectorySeedUser[] = [
  {
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    email: "alex@example.com",
    id: "1",
    name: "Alex Johnson",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=96&h=96&dpr=2&q=80",
    email: "sarah@example.com",
    id: "2",
    name: "Sarah Chen",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1584308972272-9e4e7685e80f?w=96&h=96&dpr=2&q=80",
    email: "michael@example.com",
    id: "3",
    name: "Michael Rodriguez",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=96&h=96&dpr=2&q=80",
    email: "emma@example.com",
    id: "4",
    name: "Emma Wilson",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=96&h=96&dpr=2&q=80",
    email: "david@example.com",
    id: "5",
    name: "David Kim",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=96&h=96&dpr=2&q=80",
    email: "aron@example.com",
    id: "6",
    name: "Aron Thompson",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1543299750-19d1d6297053?w=96&h=96&dpr=2&q=80",
    email: "james@example.com",
    id: "7",
    name: "James Brown",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1620075225255-8c2051b6c015?w=96&h=96&dpr=2&q=80",
    email: "maria@example.com",
    id: "8",
    name: "Maria Garcia",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1485206412256-701ccc5b93ca?w=96&h=96&dpr=2&q=80",
    email: "nick@example.com",
    id: "9",
    name: "Nick Johnson",
  },
  {
    avatar:
      "https://images.unsplash.com/photo-1542595913-85d69b0edbaf?w=96&h=96&dpr=2&q=80",
    email: "liam@example.com",
    id: "10",
    name: "Liam Thompson",
  },
];

const staffDirectoryMockData: StaffDirectoryRow[] = staffDirectorySeedUsers.map(
  (user, index) => ({
    ...user,
    availability: (["online", "away", "busy", "offline"] as const)[index % 4],
    company: (
      [
        "Apple",
        "OpenAI",
        "Meta",
        "Tesla",
        "SAP",
        "Keenthemes",
        "BBVA",
        "Sony",
        "LVMH",
        "ENI",
      ] as const
    )[index % 10],
    joined: "Jan, 2024",
    role: (
      [
        "CEO",
        "CTO",
        "Designer",
        "Developer",
        "Lawyer",
        "Director",
        "Product Manager",
        "Marketing Lead",
        "Data Scientist",
        "Engineer",
      ] as const
    )[index % 10],
    status: index % 2 === 0 ? "active" : "inactive",
  })
);

export {
  staffDirectoryMockData,
  staffDirectorySeedUsers,
  type StaffDirectoryRow,
};
