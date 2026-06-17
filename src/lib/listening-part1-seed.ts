/** Part 1 mẫu — ảnh Unsplash (free), mô tả dạng text (luyện đọc hiểu). */

export interface Part1Question {
  id: string;
  imageUrl: string;
  imageAlt: string;
  photographer: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanationVi: string;
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const PART1_SEED: Part1Question[] = [
  {
    id: "p1-1",
    imageUrl: u("photo-1521737711862-e3fd11599689"),
    imageAlt: "Team meeting in office",
    photographer: "Unsplash",
    options: [
      "They're having a team discussion around a table.",
      "They're loading boxes onto a truck.",
      "They're waiting at an airport gate.",
      "They're cooking in a restaurant kitchen.",
    ],
    correctIndex: 0,
    explanationVi: "Ảnh mô tả cuộc họp nhóm trong văn phòng — ngồi quanh bàn trao đổi.",
  },
  {
    id: "p1-2",
    imageUrl: u("photo-1497215844900-cb408d9575aa"),
    imageAlt: "Person working on laptop",
    photographer: "Unsplash",
    options: [
      "A worker is giving a presentation on stage.",
      "Someone is typing on a laptop at a desk.",
      "Passengers are boarding an airplane.",
      "Customers are paying at a cash register.",
    ],
    correctIndex: 1,
    explanationVi: "Người đang gõ laptop tại bàn làm việc.",
  },
  {
    id: "p1-3",
    imageUrl: u("photo-1586528110311-ad8dd2c5d41b"),
    imageAlt: "Warehouse with shelves",
    photographer: "Unsplash",
    options: [
      "Items are stored on shelves in a warehouse.",
      "People are swimming in a pool.",
      "A doctor is examining a patient.",
      "Students are taking an outdoor exam.",
    ],
    correctIndex: 0,
    explanationVi: "Kho hàng với kệ chứa hàng hóa.",
  },
  {
    id: "p1-4",
    imageUrl: u("photo-1552664730-d307ca884978"),
    imageAlt: "Business presentation",
    photographer: "Unsplash",
    options: [
      "A presenter is speaking to colleagues in a meeting room.",
      "Workers are harvesting crops in a field.",
      "Tourists are buying tickets at a museum.",
      "Mechanics are repairing a car engine.",
    ],
    correctIndex: 0,
    explanationVi: "Người thuyết trình trước đồng nghiệp trong phòng họp.",
  },
  {
    id: "p1-5",
    imageUrl: u("photo-1436491865339-9a89fa387dae"),
    imageAlt: "Airplane wing above clouds",
    photographer: "Unsplash",
    options: [
      "An airplane is flying above the clouds.",
      "A ship is docking at a harbor.",
      "A train is arriving at a station.",
      "A bus is parked at a bus stop.",
    ],
    correctIndex: 0,
    explanationVi: "Máy bay đang bay trên mây — góc nhìn từ cửa sổ.",
  },
  {
    id: "p1-6",
    imageUrl: u("photo-1524758632044-f6d0ed9f36c3"),
    imageAlt: "Modern office workspace",
    photographer: "Unsplash",
    options: [
      "Employees are working in a modern office space.",
      "Athletes are competing in a stadium.",
      "Chefs are preparing food in a cafeteria.",
      "Gardeners are planting trees in a park.",
    ],
    correctIndex: 0,
    explanationVi: "Không gian văn phòng hiện đại — môi trường làm việc.",
  },
];
