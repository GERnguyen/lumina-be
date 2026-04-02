import "reflect-metadata";
import bcrypt from "bcrypt";
import { Faker, vi } from "@faker-js/faker";
import { EntityManager, QueryRunner } from "typeorm";
import { AppDataSource, initializeDatabase } from "../../data-source";
import { Answer } from "../../entities/Answer";
import { Category } from "../../entities/Category";
import { Course } from "../../entities/Course";
import { Enrollment } from "../../entities/Enrollment";
import { Lecture } from "../../entities/Lecture";
import { Order, OrderStatus } from "../../entities/Order";
import { OrderDetail } from "../../entities/OrderDetail";
import { Profile } from "../../entities/Profile";
import { Question } from "../../entities/Question";
import { Quiz } from "../../entities/Quiz";
import { Review } from "../../entities/Review";
import { Section } from "../../entities/Section";
import { Tag } from "../../entities/Tag";
import { User } from "../../entities/User";

const faker = new Faker({ locale: [vi] });

const DEFAULT_PASSWORD = "password123";
const PASSWORD_HASH_ROUNDS = 10;

type CourseFamily =
  | "web"
  | "mobile"
  | "data"
  | "design"
  | "language"
  | "business";

interface InstructorSeed {
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
}

interface CategorySeed {
  name: string;
  description: string;
  parentName?: string;
}

interface CourseBlueprint {
  title: string;
  categoryName: string;
  family: CourseFamily;
  description: string;
  sectionTitles: [string, string];
  tagNames: string[];
  thumbnailUrl: string;
}

interface SeededUsers {
  admin: User;
  instructors: User[];
  students: User[];
  studentForOrders: User;
}

interface SeededCourseContext {
  course: Course;
  firstSection: Section;
  secondSection: Section;
}

interface ReviewPlanItem {
  user: User;
  course: Course;
  rating: number;
  comment: string;
}

interface OrderPlanItem {
  courses: Course[];
}

const TABLES_TO_CLEAR = [
  "quiz_attempts",
  "lecture_completions",
  "answers",
  "questions",
  "quizzes",
  "lectures",
  "sections",
  "order_details",
  "orders",
  "enrollments",
  "reviews",
  "course_tags",
  "user_favorites",
  "cart_items",
  "carts",
  "courses",
  "tags",
  "profiles",
  "categories",
  "otp_records",
  "users",
] as const;

const ROOT_CATEGORIES: CategorySeed[] = [
  {
    name: "Lập trình",
    description:
      "Các khóa học kỹ thuật phần mềm, lập trình ứng dụng và phân tích dữ liệu.",
  },
  {
    name: "Thiết kế",
    description: "Các khóa học về tư duy thiết kế, giao diện và đồ họa số.",
  },
  {
    name: "Ngoại ngữ",
    description:
      "Các lộ trình học ngôn ngữ thực tế cho giao tiếp và công việc.",
  },
  {
    name: "Kinh doanh số",
    description: "Các khóa học về marketing, bán hàng và xây dựng thương hiệu.",
  },
];

const CHILD_CATEGORIES: CategorySeed[] = [
  {
    name: "Lập trình Web",
    description: "Lộ trình xây dựng website, API và hệ thống web hiện đại.",
    parentName: "Lập trình",
  },
  {
    name: "Lập trình Mobile",
    description: "Lộ trình tạo ứng dụng iOS và Android đa nền tảng.",
    parentName: "Lập trình",
  },
  {
    name: "Khoa học dữ liệu",
    description: "Lộ trình làm sạch, phân tích và trực quan hóa dữ liệu.",
    parentName: "Lập trình",
  },
  {
    name: "UI/UX",
    description:
      "Tư duy trải nghiệm người dùng và thiết kế giao diện trực quan.",
    parentName: "Thiết kế",
  },
  {
    name: "Đồ họa 2D",
    description: "Thiết kế ấn phẩm, banner và hình ảnh truyền thông.",
    parentName: "Thiết kế",
  },
  {
    name: "Tiếng Anh",
    description: "Lộ trình tiếng Anh giao tiếp, công sở và phỏng vấn.",
    parentName: "Ngoại ngữ",
  },
  {
    name: "Tiếng Nhật",
    description: "Lộ trình tiếng Nhật sơ cấp và giao tiếp hằng ngày.",
    parentName: "Ngoại ngữ",
  },
  {
    name: "Marketing số",
    description: "Chiến lược marketing đa kênh và đo lường hiệu quả.",
    parentName: "Kinh doanh số",
  },
  {
    name: "Bán hàng online",
    description: "Vận hành gian hàng, tối ưu nội dung và chốt đơn hiệu quả.",
    parentName: "Kinh doanh số",
  },
  {
    name: "Xây dựng thương hiệu cá nhân",
    description: "Tạo dấu ấn cá nhân trên mạng xã hội và kênh nội dung số.",
    parentName: "Kinh doanh số",
  },
];

const TAG_NAMES = [
  "Thực chiến",
  "Dự án",
  "Cơ bản",
  "Nâng cao",
  "Frontend",
  "Backend",
  "Di động",
  "Thiết kế",
  "Dữ liệu",
  "Tiếng Anh",
  "Tiếng Nhật",
  "Marketing",
  "Bán hàng",
  "Khởi nghiệp",
  "UI/UX",
];

const INSTRUCTOR_AVATARS = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=640&q=80",
];

const STUDENT_AVATARS = [
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=640&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=80",
];

const COURSE_THUMBNAILS: Record<CourseFamily, string[]> = {
  web: [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516321310762-479bf5f6f0c?auto=format&fit=crop&w=1200&q=80",
  ],
  mobile: [
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  ],
  data: [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=1200&q=80",
  ],
  design: [
    "https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  ],
  language: [
    "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
  ],
  business: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1516321310762-479bf5f6f0c?auto=format&fit=crop&w=1200&q=80",
  ],
};

const COURSE_BLUEPRINTS: CourseBlueprint[] = [
  {
    title: "Khóa học ReactJS thực chiến từ A-Z",
    categoryName: "Lập trình Web",
    family: "web",
    description:
      "Lộ trình giúp bạn nắm vững ReactJS, tư duy component và cách triển khai một giao diện web có cấu trúc rõ ràng.",
    sectionTitles: [
      "Nền tảng JavaScript và tư duy component",
      "Props, State và quản lý dữ liệu",
    ],
    tagNames: ["Frontend", "Thực chiến", "Cơ bản"],
    thumbnailUrl: COURSE_THUMBNAILS.web[0],
  },
  {
    title: "Node.js và Express xây dựng API chuẩn production",
    categoryName: "Lập trình Web",
    family: "web",
    description:
      "Bạn sẽ học cách tổ chức API, xử lý lỗi và xây dựng backend gọn gàng để sẵn sàng đưa vào sản phẩm thật.",
    sectionTitles: [
      "Thiết kế API và cấu trúc dự án",
      "Xác thực, phân quyền và xử lý lỗi",
    ],
    tagNames: ["Backend", "Thực chiến", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.web[1],
  },
  {
    title: "TypeScript cho lập trình viên JavaScript",
    categoryName: "Lập trình Web",
    family: "web",
    description:
      "Khóa học giúp bạn chuyển từ JavaScript sang TypeScript một cách tự tin, an toàn và dễ bảo trì hơn.",
    sectionTitles: [
      "Kiểu dữ liệu, interface và type alias",
      "Generic, OOP và thực hành",
    ],
    tagNames: ["Frontend", "Backend", "Nâng cao"],
    thumbnailUrl: COURSE_THUMBNAILS.web[0],
  },
  {
    title: "Next.js thực chiến: xây dựng website hiện đại",
    categoryName: "Lập trình Web",
    family: "web",
    description:
      "Khóa học tập trung vào routing, rendering và cách tối ưu một website có trải nghiệm người dùng tốt.",
    sectionTitles: [
      "Server Side Rendering và routing",
      "Tối ưu hiệu năng và triển khai",
    ],
    tagNames: ["Frontend", "Dự án", "Nâng cao"],
    thumbnailUrl: COURSE_THUMBNAILS.web[1],
  },
  {
    title: "Flutter tạo ứng dụng di động đa nền tảng",
    categoryName: "Lập trình Mobile",
    family: "mobile",
    description:
      "Bạn sẽ học cách xây dựng ứng dụng Flutter mượt mà, dễ mở rộng và có giao diện thân thiện với người dùng.",
    sectionTitles: [
      "Làm quen với widget và layout",
      "Điều hướng màn hình và gọi API",
    ],
    tagNames: ["Di động", "Dự án", "Cơ bản"],
    thumbnailUrl: COURSE_THUMBNAILS.mobile[0],
  },
  {
    title: "React Native thực chiến: tạo app đặt lịch",
    categoryName: "Lập trình Mobile",
    family: "mobile",
    description:
      "Lộ trình giúp bạn đi từ giao diện đến tích hợp API và lưu trạng thái để làm được một app hoàn chỉnh.",
    sectionTitles: [
      "Cấu trúc dự án và màn hình chính",
      "State management và lưu dữ liệu",
    ],
    tagNames: ["Di động", "Thực chiến", "Frontend"],
    thumbnailUrl: COURSE_THUMBNAILS.mobile[1],
  },
  {
    title: "Kotlin Android cơ bản đến thực hành",
    categoryName: "Lập trình Mobile",
    family: "mobile",
    description:
      "Khóa học giúp bạn làm quen với vòng đời màn hình, danh sách và các mẫu xử lý dữ liệu trên Android.",
    sectionTitles: [
      "Activity, Fragment và vòng đời",
      "Danh sách, form và lưu trữ cục bộ",
    ],
    tagNames: ["Di động", "Cơ bản", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.mobile[0],
  },
  {
    title: "Python phân tích dữ liệu với Pandas",
    categoryName: "Khoa học dữ liệu",
    family: "data",
    description:
      "Lộ trình giúp bạn làm sạch dữ liệu, phân tích chỉ số quan trọng và trình bày kết quả bằng biểu đồ rõ ràng.",
    sectionTitles: [
      "Làm sạch và chuẩn hóa dữ liệu",
      "Thống kê mô tả và biểu đồ",
    ],
    tagNames: ["Dữ liệu", "Cơ bản", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.data[0],
  },
  {
    title: "Machine Learning nhập môn thực hành",
    categoryName: "Khoa học dữ liệu",
    family: "data",
    description:
      "Khóa học đưa bạn đi qua quy trình tiền xử lý, huấn luyện và đánh giá mô hình bằng các bài tập gần với thực tế.",
    sectionTitles: [
      "Tiền xử lý dữ liệu và chia tập",
      "Huấn luyện mô hình phân loại",
    ],
    tagNames: ["Dữ liệu", "Nâng cao", "Thực chiến"],
    thumbnailUrl: COURSE_THUMBNAILS.data[1],
  },
  {
    title: "Làm chủ UI/UX với Figma",
    categoryName: "UI/UX",
    family: "design",
    description:
      "Khóa học tập trung vào tư duy trải nghiệm, prototype và cách xây dựng bộ thành phần giao diện đồng bộ.",
    sectionTitles: [
      "Tư duy thiết kế và nghiên cứu người dùng",
      "Prototype, component và design system",
    ],
    tagNames: ["Thiết kế", "UI/UX", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.design[0],
  },
  {
    title: "Thiết kế giao diện web hiện đại",
    categoryName: "UI/UX",
    family: "design",
    description:
      "Bạn sẽ học cách xây dựng bố cục đẹp, nhất quán và dễ đọc cho các màn hình web thực tế.",
    sectionTitles: [
      "Bố cục lưới và hệ thống màu sắc",
      "Typography và trạng thái tương tác",
    ],
    tagNames: ["Thiết kế", "Frontend", "UI/UX"],
    thumbnailUrl: COURSE_THUMBNAILS.design[1],
  },
  {
    title: "Đồ họa 2D với Photoshop",
    categoryName: "Đồ họa 2D",
    family: "design",
    description:
      "Khóa học giúp bạn thao tác layer, chỉnh màu và tạo ấn phẩm truyền thông trông chuyên nghiệp hơn.",
    sectionTitles: [
      "Cắt ghép, chỉnh màu và layer",
      "Thiết kế banner và ấn phẩm truyền thông",
    ],
    tagNames: ["Thiết kế", "Dự án", "Cơ bản"],
    thumbnailUrl: COURSE_THUMBNAILS.design[0],
  },
  {
    title: "Adobe Illustrator cho người mới bắt đầu",
    categoryName: "Đồ họa 2D",
    family: "design",
    description:
      "Bạn sẽ học cách vẽ vector, tạo biểu tượng và xử lý logo theo quy trình dễ hiểu, thực hành được ngay.",
    sectionTitles: [
      "Vẽ vector và xử lý đối tượng",
      "Thiết kế biểu tượng và logo",
    ],
    tagNames: ["Thiết kế", "Cơ bản", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.design[1],
  },
  {
    title: "Tiếng Anh giao tiếp công sở",
    categoryName: "Tiếng Anh",
    family: "language",
    description:
      "Lộ trình giúp bạn tự tin gặp gỡ, trao đổi công việc và viết email trong môi trường văn phòng.",
    sectionTitles: [
      "Mẫu câu gặp gỡ và giới thiệu bản thân",
      "Họp, email và phản hồi",
    ],
    tagNames: ["Tiếng Anh", "Cơ bản", "Thực chiến"],
    thumbnailUrl: COURSE_THUMBNAILS.language[0],
  },
  {
    title: "Tiếng Anh cho người mới bắt đầu",
    categoryName: "Tiếng Anh",
    family: "language",
    description:
      "Bạn sẽ xây nền tảng phát âm, từ vựng và ngữ pháp để bắt đầu giao tiếp hàng ngày dễ hơn.",
    sectionTitles: [
      "Phát âm cơ bản và từ vựng nền tảng",
      "Ngữ pháp thông dụng trong giao tiếp",
    ],
    tagNames: ["Tiếng Anh", "Cơ bản", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.language[1],
  },
  {
    title: "Tiếng Nhật sơ cấp N5",
    categoryName: "Tiếng Nhật",
    family: "language",
    description:
      "Khóa học đưa bạn vào hệ chữ Kana, mẫu câu chào hỏi và các tình huống giao tiếp đơn giản nhất.",
    sectionTitles: [
      "Hiragana, Katakana và cách phát âm",
      "Mẫu câu chào hỏi và giới thiệu",
    ],
    tagNames: ["Tiếng Nhật", "Cơ bản", "Thực chiến"],
    thumbnailUrl: COURSE_THUMBNAILS.language[0],
  },
  {
    title: "Tiếng Nhật giao tiếp du lịch",
    categoryName: "Tiếng Nhật",
    family: "language",
    description:
      "Bạn sẽ học các mẫu câu cần thiết khi đặt phòng, hỏi đường, gọi món và di chuyển ở Nhật Bản.",
    sectionTitles: [
      "Đặt phòng, hỏi đường và mua vé",
      "Giao tiếp tại nhà hàng và sân bay",
    ],
    tagNames: ["Tiếng Nhật", "Thực chiến", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.language[1],
  },
  {
    title: "Marketing số từ nền tảng đến thực chiến",
    categoryName: "Marketing số",
    family: "business",
    description:
      "Khóa học giúp bạn xây chiến dịch đa kênh, hiểu khách hàng và đo lường hiệu quả marketing rõ ràng hơn.",
    sectionTitles: [
      "Nghiên cứu khách hàng và định vị sản phẩm",
      "Chiến dịch quảng cáo và đo lường",
    ],
    tagNames: ["Marketing", "Thực chiến", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.business[0],
  },
  {
    title: "Bán hàng online hiệu quả trên sàn thương mại điện tử",
    categoryName: "Bán hàng online",
    family: "business",
    description:
      "Bạn sẽ biết cách tối ưu gian hàng, đăng sản phẩm và chăm sóc khách hàng để cải thiện doanh số.",
    sectionTitles: [
      "Tối ưu gian hàng và nội dung sản phẩm",
      "Chăm sóc khách hàng và xử lý đơn",
    ],
    tagNames: ["Bán hàng", "Marketing", "Thực chiến"],
    thumbnailUrl: COURSE_THUMBNAILS.business[1],
  },
  {
    title: "Xây dựng thương hiệu cá nhân trên mạng xã hội",
    categoryName: "Xây dựng thương hiệu cá nhân",
    family: "business",
    description:
      "Khóa học hướng dẫn bạn kể câu chuyện cá nhân, lên kế hoạch nội dung và tạo độ tin cậy trên nền tảng số.",
    sectionTitles: [
      "Xác định câu chuyện cá nhân",
      "Lên kế hoạch nội dung và tương tác",
    ],
    tagNames: ["Khởi nghiệp", "Marketing", "Dự án"],
    thumbnailUrl: COURSE_THUMBNAILS.business[0],
  },
];

const STUDENT_PREFERENCES = [
  "thích học theo lộ trình ngắn gọn và thực hành ngay",
  "ưu tiên bài giảng rõ ràng, dễ xem lại khi cần",
  "thường xem bài vào buổi tối sau giờ làm",
  "thích có ví dụ thực tế và bài tập nhỏ sau mỗi phần",
  "hay ghi chú lại các mẹo quan trọng trong bài học",
];

const REVIEW_COMMENTS = {
  5: [
    "Khóa học rất hay, giảng viên giải thích rõ ràng và có ví dụ thực tế.",
    "Nội dung sát nhu cầu công việc, học xong áp dụng được ngay.",
    "Cấu trúc bài học hợp lý, càng học càng dễ hiểu.",
  ],
  4: [
    "Nội dung tốt, chỉ cần thêm vài bài tập thực hành nữa là hoàn hảo.",
    "Giảng viên nhiệt tình, phần demo hơi nhanh nhưng vẫn theo kịp.",
    "Bài giảng dễ hiểu, âm thanh có lúc hơi nhỏ nhưng nhìn chung ổn.",
  ],
  3: [
    "Khóa học hữu ích, tôi muốn thêm nhiều ví dụ thực tế hơn.",
    "Có vài đoạn hơi nhanh nhưng vẫn nắm được ý chính.",
    "Nội dung cơ bản phù hợp người mới, nên thêm bài tập cuối chương.",
  ],
} as const;

const QUESTION_LIBRARY = {
  web: {
    correct: "Hiểu nguyên tắc cốt lõi và áp dụng vào bài tập thực tế",
    wrongs: [
      "Chỉ học thuộc khái niệm mà không thực hành",
      "Bỏ qua bước kiểm thử trước khi bàn giao",
      "Viết code mà không cần cấu trúc rõ ràng",
    ],
  },
  mobile: {
    correct: "Thiết kế màn hình rõ ràng và quản lý trạng thái hợp lý",
    wrongs: [
      "Gộp mọi logic vào một màn hình duy nhất",
      "Chỉ tập trung vào giao diện mà bỏ qua trải nghiệm người dùng",
      "Không kiểm tra ứng dụng trên thiết bị thật",
    ],
  },
  data: {
    correct: "Làm sạch dữ liệu rồi mới phân tích và trực quan hóa",
    wrongs: [
      "Vẽ biểu đồ ngay khi chưa kiểm tra dữ liệu",
      "Bỏ qua dữ liệu thiếu và giá trị bất thường",
      "Chọn mô hình trước khi hiểu dữ liệu đầu vào",
    ],
  },
  design: {
    correct: "Giữ bố cục rõ ràng, nhất quán và dễ đọc",
    wrongs: [
      "Dùng quá nhiều màu để tạo cảm giác nổi bật",
      "Đặt mọi thành phần sát nhau mà không có khoảng trắng",
      "Chọn font ngẫu nhiên cho từng màn hình",
    ],
  },
  language: {
    correct: "Luyện phản xạ nghe, nói trong ngữ cảnh thực tế",
    wrongs: [
      "Chỉ học từ vựng mà không nói thành câu",
      "Bỏ qua phát âm vì cho rằng không quan trọng",
      "Học thuộc toàn bộ ngữ pháp trước khi luyện giao tiếp",
    ],
  },
  business: {
    correct: "Xác định khách hàng mục tiêu và theo dõi hiệu quả",
    wrongs: [
      "Chạy quảng cáo mà không đặt mục tiêu rõ ràng",
      "Tập trung thật nhiều nội dung nhưng không đo lường",
      "Bỏ qua phản hồi của khách hàng sau bán hàng",
    ],
  },
} as const;

const randomElement = <T>(items: T[]): T =>
  items[faker.number.int({ min: 0, max: items.length - 1 })];

const randomUniqueElements = <T>(items: T[], count: number): T[] => {
  const pool = [...items];
  const selected: T[] = [];

  while (selected.length < count && pool.length > 0) {
    const index = faker.number.int({ min: 0, max: pool.length - 1 });
    selected.push(pool[index]);
    pool.splice(index, 1);
  }

  return selected;
};

const slugifyVietnamese = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const buildCourseSlug = (title: string, index: number): string =>
  `${slugifyVietnamese(title)}-${index + 1}-${faker.string.alphanumeric(4).toLowerCase()}`;

const buildCourseDescription = (blueprint: CourseBlueprint): string =>
  `${blueprint.description} Sau khi hoàn thành, bạn sẽ có nền tảng rõ ràng để áp dụng vào dự án hoặc công việc thực tế.`;

const buildLectureContent = (
  courseTitle: string,
  sectionTitle: string,
  family: CourseFamily,
): string => {
  const familySentence: Record<CourseFamily, string> = {
    web: "Phần này giúp bạn hiểu cách tổ chức luồng xử lý và xây dựng giao diện có cấu trúc rõ ràng.",
    mobile:
      "Phần này tập trung vào bố cục màn hình, trạng thái và trải nghiệm người dùng trên thiết bị di động.",
    data: "Phần này hướng đến cách làm sạch dữ liệu, phân tích hợp lý và rút ra insight có giá trị.",
    design:
      "Phần này giúp bạn xây dựng bố cục đẹp, nhất quán và dễ đọc hơn cho người dùng.",
    language:
      "Phần này hỗ trợ bạn ghi nhớ mẫu câu và sử dụng trong bối cảnh giao tiếp tự nhiên.",
    business:
      "Phần này tập trung vào cách xác định khách hàng, lên kế hoạch và đo lường kết quả.",
  };

  return [
    `Trong khóa ${courseTitle}, bài ${sectionTitle.toLowerCase()} được thiết kế để đi từ khái niệm đến cách làm thực tế.`,
    familySentence[family],
    "Hãy kết hợp xem bài giảng, ghi chú ngắn và làm lại ví dụ nhiều lần để ghi nhớ tốt hơn.",
  ].join(" ");
};

const buildLectureTitle = (sectionTitle: string): string =>
  `Bài 1: ${sectionTitle}`;

const buildQuizTitle = (sectionTitle: string): string =>
  `Quiz kiểm tra ${sectionTitle}`;

const buildQuestionContent = (
  family: CourseFamily,
  sectionTitle: string,
  questionIndex: number,
): string => {
  const prompts: Record<CourseFamily, [string, string]> = {
    web: [
      `Trong phần "${sectionTitle}", yếu tố nào là quan trọng nhất để bắt đầu?`,
      `Khi làm bài tập ở phần "${sectionTitle}", bạn nên ưu tiên điều gì?`,
    ],
    mobile: [
      `Trong phần "${sectionTitle}", điều nào giúp ứng dụng dễ sử dụng hơn?`,
      `Khi hoàn thiện phần "${sectionTitle}", bạn nên kiểm tra điều gì trước?`,
    ],
    data: [
      `Trong phần "${sectionTitle}", bước nào nên làm trước khi phân tích?`,
      `Khi đọc kết quả ở phần "${sectionTitle}", bạn nên chú ý điều gì nhất?`,
    ],
    design: [
      `Trong phần "${sectionTitle}", yếu tố nào cần được chú trọng nhất?`,
      `Khi thực hành phần "${sectionTitle}", bạn nên ưu tiên điều gì để thiết kế rõ ràng hơn?`,
    ],
    language: [
      `Trong phần "${sectionTitle}", phương pháp nào giúp nhớ bài tốt hơn?`,
      `Khi luyện tập phần "${sectionTitle}", bạn nên ưu tiên kỹ năng nào?`,
    ],
    business: [
      `Trong phần "${sectionTitle}", chỉ số nào nên được quan tâm đầu tiên?`,
      `Khi áp dụng phần "${sectionTitle}", bước nào giúp bạn đánh giá hiệu quả tốt hơn?`,
    ],
  };

  return prompts[family][questionIndex - 1];
};

const buildQuestionAnswers = (
  family: CourseFamily,
): Array<{ content: string; isCorrect: boolean }> => {
  const library = QUESTION_LIBRARY[family];

  return [
    { content: library.correct, isCorrect: true },
    { content: library.wrongs[0], isCorrect: false },
    { content: library.wrongs[1], isCorrect: false },
    { content: library.wrongs[2], isCorrect: false },
  ];
};

const buildReviewComment = (rating: number): string => {
  const pool = REVIEW_COMMENTS[rating as 3 | 4 | 5];
  return randomElement(pool as unknown as string[]);
};

const chooseDiscountPercent = (): number => {
  const discountOptions = [10, 15, 20, 25, 30, 35, 40, 45, 50];
  return randomElement(discountOptions);
};

const chooseThumbnail = (family: CourseFamily): string =>
  randomElement(COURSE_THUMBNAILS[family]);

const clearDatabase = async (queryRunner: QueryRunner): Promise<void> => {
  await queryRunner.query("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of TABLES_TO_CLEAR) {
    await queryRunner.query(`DELETE FROM \`${table}\``);
  }

  await queryRunner.query("SET FOREIGN_KEY_CHECKS = 1");
};

const seedUsers = async (manager: EntityManager): Promise<SeededUsers> => {
  const userRepo = manager.getRepository(User);
  const profileRepo = manager.getRepository(Profile);
  const passwordHash = await bcrypt.hash(
    DEFAULT_PASSWORD,
    PASSWORD_HASH_ROUNDS,
  );

  const admin = userRepo.create({
    email: "admin@cinx.local",
    password: passwordHash,
    role: "admin",
    isActive: true,
    rewardPoints: 0,
  });

  const instructorSeeds: InstructorSeed[] = [
    {
      email: "instructor1@cinx.local",
      fullName: faker.person.fullName(),
      bio: "Chuyên gia phát triển web với nhiều năm kinh nghiệm xây dựng sản phẩm thương mại điện tử và hệ thống nội bộ cho doanh nghiệp.",
      avatar: INSTRUCTOR_AVATARS[0],
    },
    {
      email: "instructor2@cinx.local",
      fullName: faker.person.fullName(),
      bio: "Chuyên gia mobile tập trung vào Flutter và React Native, có kinh nghiệm triển khai ứng dụng cho đội ngũ sản phẩm quy mô vừa và lớn.",
      avatar: INSTRUCTOR_AVATARS[1],
    },
    {
      email: "instructor3@cinx.local",
      fullName: faker.person.fullName(),
      bio: "Chuyên gia dữ liệu với thế mạnh về Python, SQL và trực quan hóa dữ liệu phục vụ báo cáo kinh doanh.",
      avatar: INSTRUCTOR_AVATARS[2],
    },
    {
      email: "instructor4@cinx.local",
      fullName: faker.person.fullName(),
      bio: "Chuyên gia thiết kế sản phẩm số và branding, có kinh nghiệm xây dựng hệ thống nhận diện cho startup và thương hiệu cá nhân.",
      avatar: INSTRUCTOR_AVATARS[3],
    },
  ];

  const studentSeeds = [
    {
      email: "student@cinx.local",
      fullName: "Nguyễn Minh Khoa",
      bio: "Học viên đang theo lộ trình kỹ năng số để chuyển việc và làm dự án thực tế.",
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: 250,
    },
    {
      email: "student2@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student3@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student4@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student5@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student6@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student7@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student8@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student9@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student10@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student11@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student12@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student13@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student14@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
    {
      email: "student15@cinx.local",
      fullName: faker.person.fullName(),
      bio: `Học viên ưu tiên học theo bài ngắn gọn và ${randomElement(STUDENT_PREFERENCES)}.`,
      avatar: randomElement(STUDENT_AVATARS),
      rewardPoints: faker.number.int({ min: 0, max: 120 }),
    },
  ];

  const users = await userRepo.save([
    admin,
    ...instructorSeeds.map((seed) =>
      userRepo.create({
        email: seed.email,
        password: passwordHash,
        role: "instructor",
        isActive: true,
        rewardPoints: 0,
      }),
    ),
    ...studentSeeds.map((seed) =>
      userRepo.create({
        email: seed.email,
        password: passwordHash,
        role: "student",
        isActive: true,
        rewardPoints: seed.rewardPoints,
      }),
    ),
  ]);

  const savedAdmin = users[0];
  const savedInstructors = users.slice(1, 5);
  const savedStudents = users.slice(5);

  const profiles = [
    profileRepo.create({
      fullName: "Quản trị viên Cinx",
      avatar: randomElement(STUDENT_AVATARS),
      bio: "Quản trị viên hệ thống chịu trách nhiệm giám sát dữ liệu và duyệt nội dung.",
      user: savedAdmin,
    }),
    ...savedInstructors.map((user, index) =>
      profileRepo.create({
        fullName: instructorSeeds[index].fullName,
        avatar: instructorSeeds[index].avatar,
        bio: instructorSeeds[index].bio,
        user,
      }),
    ),
    ...savedStudents.map((user, index) =>
      profileRepo.create({
        fullName: studentSeeds[index].fullName,
        avatar: studentSeeds[index].avatar,
        bio: studentSeeds[index].bio,
        user,
      }),
    ),
  ];

  await profileRepo.save(profiles);

  return {
    admin: savedAdmin,
    instructors: savedInstructors,
    students: savedStudents,
    studentForOrders:
      savedStudents.find((user) => user.email === "student@cinx.local") ??
      savedStudents[0],
  };
};

const seedCategories = async (
  manager: EntityManager,
): Promise<Map<string, Category>> => {
  const categoryRepo = manager.getRepository(Category);
  const categoryMap = new Map<string, Category>();

  const roots = await categoryRepo.save(
    ROOT_CATEGORIES.map((item) =>
      categoryRepo.create({
        name: item.name,
        description: item.description,
      }),
    ),
  );

  for (const category of roots) {
    categoryMap.set(category.name, category);
  }

  const children = await categoryRepo.save(
    CHILD_CATEGORIES.map((item) =>
      categoryRepo.create({
        name: item.name,
        description: item.description,
        parent: categoryMap.get(item.parentName ?? ""),
      }),
    ),
  );

  for (const category of children) {
    categoryMap.set(category.name, category);
  }

  return categoryMap;
};

const seedTags = async (manager: EntityManager): Promise<Map<string, Tag>> => {
  const tagRepo = manager.getRepository(Tag);
  const tagMap = new Map<string, Tag>();
  const savedTags = await tagRepo.save(
    TAG_NAMES.map((name) =>
      tagRepo.create({
        name,
      }),
    ),
  );

  for (const tag of savedTags) {
    tagMap.set(tag.name, tag);
  }

  return tagMap;
};

const seedCourses = async (
  manager: EntityManager,
  instructors: User[],
  categories: Map<string, Category>,
  tags: Map<string, Tag>,
): Promise<Course[]> => {
  const courseRepo = manager.getRepository(Course);

  const courseEntities = COURSE_BLUEPRINTS.map((blueprint, index) => {
    const selectedTags = blueprint.tagNames
      .map((name) => tags.get(name))
      .filter((tag): tag is Tag => Boolean(tag));

    return courseRepo.create({
      title: blueprint.title,
      slug: buildCourseSlug(blueprint.title, index),
      description: buildCourseDescription(blueprint),
      thumbnailUrl: blueprint.thumbnailUrl,
      price: faker.number.int({ min: 100_000, max: 2_000_000 }),
      enrollmentCount: faker.number.int({ min: 20, max: 650 }),
      discountPercent: Math.random() < 0.3 ? chooseDiscountPercent() : 0,
      averageRating: 0,
      reviewCount: 0,
      isActive: true,
      publishedAt: faker.date.recent({ days: 180 }),
      instructor: randomElement(instructors),
      category: categories.get(blueprint.categoryName),
      tags: selectedTags,
    });
  });

  return courseRepo.save(courseEntities);
};

const seedCourseStructure = async (
  manager: EntityManager,
  courses: Course[],
): Promise<SeededCourseContext[]> => {
  const sectionRepo = manager.getRepository(Section);
  const lectureRepo = manager.getRepository(Lecture);
  const quizRepo = manager.getRepository(Quiz);
  const questionRepo = manager.getRepository(Question);
  const answerRepo = manager.getRepository(Answer);

  const seededContexts: SeededCourseContext[] = [];

  for (let index = 0; index < courses.length; index += 1) {
    const course = courses[index];
    const blueprint = COURSE_BLUEPRINTS[index];

    const sections = await sectionRepo.save([
      sectionRepo.create({
        title: blueprint.sectionTitles[0],
        orderIndex: 1,
        course,
      }),
      sectionRepo.create({
        title: blueprint.sectionTitles[1],
        orderIndex: 2,
        course,
      }),
    ]);

    const lectures = await lectureRepo.save(
      sections.map((section, sectionIndex) =>
        lectureRepo.create({
          title: buildLectureTitle(section.title),
          contentText: buildLectureContent(
            course.title,
            section.title,
            blueprint.family,
          ),
          videoUrl: `https://www.youtube.com/watch?v=${faker.string.alphanumeric(11)}`,
          orderIndex: sectionIndex + 1,
          section,
        }),
      ),
    );

    const quizzes = await quizRepo.save(
      sections.map((section) =>
        quizRepo.create({
          title: buildQuizTitle(section.title),
          description:
            "Bài kiểm tra ngắn để củng cố kiến thức sau mỗi phần học.",
          orderIndex: 1,
          section,
        }),
      ),
    );

    for (let quizIndex = 0; quizIndex < quizzes.length; quizIndex += 1) {
      const quiz = quizzes[quizIndex];
      const section = sections[quizIndex];
      const questionEntities = questionRepo.create([
        {
          content: buildQuestionContent(blueprint.family, section.title, 1),
          orderIndex: 1,
          quiz,
        },
        {
          content: buildQuestionContent(blueprint.family, section.title, 2),
          orderIndex: 2,
          quiz,
        },
      ]);

      const savedQuestions = await questionRepo.save(questionEntities);

      for (const question of savedQuestions) {
        const answers = buildQuestionAnswers(blueprint.family).map(
          (answer, answerIndex) =>
            answerRepo.create({
              content: answer.content,
              isCorrect: answer.isCorrect,
              orderIndex: answerIndex + 1,
              question,
            }),
        );

        await answerRepo.save(answers);
      }
    }

    seededContexts.push({
      course,
      firstSection: sections[0],
      secondSection: sections[1],
    });

    void lectures;
  }

  return seededContexts;
};

const seedReviews = async (
  manager: EntityManager,
  students: User[],
  courses: Course[],
): Promise<Review[]> => {
  const reviewRepo = manager.getRepository(Review);
  const reviewPlans: ReviewPlanItem[] = [];

  for (const course of courses) {
    const firstStudent = randomElement(students);
    const firstRating = randomElement([3, 4, 4, 5, 5]);

    reviewPlans.push({
      user: firstStudent,
      course,
      rating: firstRating,
      comment: buildReviewComment(firstRating),
    });

    if (faker.number.int({ min: 1, max: 100 }) <= 50) {
      const alternateStudent = randomElement(
        students.filter((student) => student.id !== firstStudent.id),
      );
      const secondRating = randomElement([4, 4, 5, 5]);

      reviewPlans.push({
        user: alternateStudent,
        course,
        rating: secondRating,
        comment: buildReviewComment(secondRating),
      });
    }
  }

  const reviews = await reviewRepo.save(
    reviewPlans.map((plan) =>
      reviewRepo.create({
        user: plan.user,
        course: plan.course,
        rating: plan.rating,
        comment: plan.comment,
      }),
    ),
  );

  const reviewSummary = new Map<number, { sum: number; count: number }>();

  for (const plan of reviewPlans) {
    const courseId = plan.course.id;
    const currentSummary = reviewSummary.get(courseId) ?? { sum: 0, count: 0 };
    currentSummary.sum += plan.rating;
    currentSummary.count += 1;
    reviewSummary.set(courseId, currentSummary);
  }

  const courseRepo = manager.getRepository(Course);

  for (const course of courses) {
    const summary = reviewSummary.get(course.id);

    if (!summary) {
      continue;
    }

    await manager.query(
      "UPDATE courses SET review_count = ?, average_rating = ? WHERE id = ?",
      [
        summary.count,
        Number((summary.sum / summary.count).toFixed(2)),
        course.id,
      ],
    );
  }

  return reviews;
};

const seedOrdersAndEnrollments = async (
  manager: EntityManager,
  student: User,
  courses: Course[],
): Promise<{ orders: Order[]; enrollments: Enrollment[] }> => {
  const orderRepo = manager.getRepository(Order);
  const orderDetailRepo = manager.getRepository(OrderDetail);
  const enrollmentRepo = manager.getRepository(Enrollment);
  const courseRepo = manager.getRepository(Course);

  const selectedCourses = randomUniqueElements(courses, 4);
  const [firstOrderCourses, secondOrderCourses] = [
    selectedCourses.slice(0, 2),
    selectedCourses.slice(2, 4),
  ];

  const buildOrder = async (orderCourses: Course[]): Promise<Order> => {
    const order = await orderRepo.save(
      orderRepo.create({
        user: student,
        status: OrderStatus.PAID,
        totalAmount: 0,
        discountAmount: 0,
        paymentMethod: "momo",
        paidAt: new Date(),
      }),
    );

    const details = orderCourses.map((course) => {
      const unitPrice = Number(course.price);
      const discountAmount = Number(
        ((unitPrice * Number(course.discountPercent)) / 100).toFixed(2),
      );

      return orderDetailRepo.create({
        order,
        course,
        unitPrice,
        discountAmount,
        finalPrice: Number((unitPrice - discountAmount).toFixed(2)),
      });
    });

    const savedDetails = await orderDetailRepo.save(details);
    const totalAmount = savedDetails.reduce(
      (sum, detail) => sum + Number(detail.finalPrice),
      0,
    );
    const totalDiscount = savedDetails.reduce(
      (sum, detail) => sum + Number(detail.discountAmount),
      0,
    );

    order.totalAmount = Number(totalAmount.toFixed(2));
    order.discountAmount = Number(totalDiscount.toFixed(2));

    await orderRepo.save(order);

    return order;
  };

  const orders = [
    await buildOrder(firstOrderCourses),
    await buildOrder(secondOrderCourses),
  ];

  const enrollments = await enrollmentRepo.save(
    selectedCourses.map((course) => {
      const progressOptions = [0, 50, 100];
      const progressPercent = randomElement(progressOptions);

      return enrollmentRepo.create({
        user: student,
        course,
        progressPercent,
        completedAt: progressPercent === 100 ? new Date() : undefined,
      });
    }),
  );

  for (const course of selectedCourses) {
    await courseRepo.update(course.id, {
      enrollmentCount: Number(course.enrollmentCount) + 1,
    });
  }

  return { orders, enrollments };
};

const logSummary = (payload: {
  users: SeededUsers;
  categories: Map<string, Category>;
  tags: Map<string, Tag>;
  courses: Course[];
  reviews: Review[];
  orders: Order[];
  enrollments: Enrollment[];
}): void => {
  console.log("[Seeder] Seed completed successfully.");
  console.log(
    `[Seeder] Users: ${1 + payload.users.instructors.length + payload.users.students.length}`,
  );
  console.log(`[Seeder] Categories: ${payload.categories.size}`);
  console.log(`[Seeder] Tags: ${payload.tags.size}`);
  console.log(`[Seeder] Courses: ${payload.courses.length}`);
  console.log(`[Seeder] Reviews: ${payload.reviews.length}`);
  console.log(`[Seeder] Orders: ${payload.orders.length}`);
  console.log(`[Seeder] Enrollments: ${payload.enrollments.length}`);
  console.log(`[Seeder] Default password: ${DEFAULT_PASSWORD}`);
};

const seedDatabase = async (): Promise<void> => {
  await initializeDatabase();

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    console.log("[Seeder] Clearing old data...");
    await clearDatabase(queryRunner);

    const manager = queryRunner.manager;

    console.log("[Seeder] Seeding users and profiles...");
    const users = await seedUsers(manager);

    console.log("[Seeder] Seeding categories and tags...");
    const categories = await seedCategories(manager);
    const tags = await seedTags(manager);

    console.log("[Seeder] Seeding 20 courses...");
    const courses = await seedCourses(
      manager,
      users.instructors,
      categories,
      tags,
    );

    console.log("[Seeder] Seeding course structure...");
    await seedCourseStructure(manager, courses);

    console.log("[Seeder] Seeding reviews and rating summary...");
    const reviews = await seedReviews(manager, users.students, courses);

    console.log("[Seeder] Seeding orders and enrollments...");
    const orderAndEnrollmentSeed = await seedOrdersAndEnrollments(
      manager,
      users.studentForOrders,
      courses,
    );

    await queryRunner.commitTransaction();

    logSummary({
      users,
      categories,
      tags,
      courses,
      reviews,
      orders: orderAndEnrollmentSeed.orders,
      enrollments: orderAndEnrollmentSeed.enrollments,
    });
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

void seedDatabase().catch((error) => {
  console.error("[Seeder] Failed:", error);
  process.exitCode = 1;
});
