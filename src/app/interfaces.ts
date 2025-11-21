// 定義資料介面
export interface Experience {
    company: string;
    role: string;
    period: string;
    location: string;
    type: string;
    description: string[];
    techStack: string[];
  }
  
  export interface Education {
    school: string;
    degree: string;
    period: string;
    department: string;
  }
  
  export interface SkillGroup {
    category: string;
    items: { name: string; level: number }[]; 
  }
  
  export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isError?: boolean;
  }
  