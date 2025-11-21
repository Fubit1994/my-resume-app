import { Component, signal, computed, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Experience, Education, SkillGroup, ChatMessage } from './interfaces';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class App implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  currentYear = new Date().getFullYear();

  // === 履歷資料 ===
  profile = {
    name: '洪偉晉',
    title: '高級軟體工程師',
    email: 'fubit1994@gmail.com',
    phone: '0927-275-816',
    location: '台南市安南區',
    age: 31,
    military: '役畢',
    totalExp: '4-5 年工作經歷',
    bio: '擁有 4-5 年豐富工作經驗的軟體工程師，主要負責 Vue3 前端與 .Net Core 6 API 後端開發。具備 Oracle、Greenplum 資料庫操作經驗，以及 Trinity 資料 ETL 作業能力。研究所時期專攻資料探勘與大數據分析，培養了獨立思考與解決問題的能力。目前正積極自學 Angular，期許能為團隊帶來更多元貢獻。'
  };

  experiences: Experience[] = [
    {
      company: '群創光電股份有限公司',
      role: '高級工程師 (MIS程式設計師)',
      period: '2022/9 - 仍在職',
      location: '台南市新市區',
      type: '全職',
      description: [
        'Vue3 前端開發與導入，提升開發效率與使用者體驗。',
        '.Net Core 6 API 後端開發。',
        'Git 分支與版控管理。',
        'Oracle、Greenplum 資料庫操作與 Trinity ETL 資料處理。',
        'User 問題回覆及新需求處理。'
      ],
      techStack: ['Vue3', '.NET Core', 'C#', 'Oracle', 'Git', 'Trinity']
    },
    {
      company: '前進國際股份有限公司',
      role: '軟體工程師 (群創光電外包)',
      period: '2022/4 - 2022/8',
      location: '台北市大安區 (駐點台南)',
      type: '外包',
      description: [
        'JSP 網頁 IE 轉 Chrome 瀏覽器相容性優化。',
        '處理使用者 VBA 效能問題。',
        'Asp.Net 網頁、Python 工具調整及維護。'
      ],
      techStack: ['JSP', 'VBA', 'C#', 'ASP.NET', 'Oracle']
    },
    {
      company: '漢龍資訊科技股份有限公司',
      role: '全端工程師',
      period: '2018/8 - 2022/3',
      location: '台南市永康區',
      type: '全職',
      description: [
        '使用 C# 開發 .Net MVC 架構的 Web 系統。',
        '協助評估作業所需人天、人時及客戶需求解決方案。',
        '支援 JSP 系統維護、Console/Services 工具撰寫。',
        '技術文件整理。'
      ],
      techStack: ['C#', 'ASP.NET MVC', 'MS SQL', 'HTML', 'JSP']
    },
    {
      company: '創智資訊有限公司',
      role: '程式設計實習生',
      period: '2016/2 - 2016/6',
      location: '嘉義縣民雄鄉',
      type: '實習',
      description: [
        '使用 ASP.NET、C#、JavaScript 對現有網頁系統進行修改與擴充。'
      ],
      techStack: ['ASP.NET', 'C#', 'JavaScript', 'MySQL', 'jQuery']
    }
  ];

  educations: Education[] = [
    {
      school: '南臺科技大學',
      degree: '碩士',
      department: '資訊管理系',
      period: '2016/9 - 2018/7'
    },
    {
      school: '南臺科技大學',
      degree: '學士',
      department: '資訊管理系',
      period: '2012/9 - 2016/6'
    }
  ];

  skills: SkillGroup[] = [
    {
      category: '網頁前端',
      items: [
        { name: 'Vue 3', level: 90 },
        { name: 'JavaScript / jQuery', level: 85 },
        { name: 'HTML / SCSS', level: 80 },
        { name: 'Angular', level: 40 } 
      ]
    },
    {
      category: '後端開發',
      items: [
        { name: 'C# / .NET Core', level: 90 },
        { name: 'ASP.NET MVC', level: 85 },
        { name: 'RESTful API', level: 85 },
        { name: 'Python', level: 60 }
      ]
    },
    {
      category: '資料庫 & 工具',
      items: [
        { name: 'MS SQL / Oracle', level: 80 },
        { name: 'Git / GitLab', level: 85 },
        { name: 'Trinity (ETL)', level: 75 }
      ]
    }
  ];

  // === AI Chat Logic ===
  isChatOpen = false;
  isChatLoading = false;
  userChatInput = '';
  chatMessages: ChatMessage[] = [];
  
  // === Cover Letter Logic ===
  isCoverLetterModalOpen = false;
  isCoverLetterLoading = false;
  jobDescription = '';
  generatedCoverLetter = '';

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      if(this.chatContainer) {
        this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
      }
    } catch(err) { }
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  quickAsk(question: string) {
    this.userChatInput = question;
    this.sendMessage();
  }

  async sendMessage() {
    if (!this.userChatInput.trim() || this.isChatLoading) return;

    const userText = this.userChatInput;
    this.chatMessages.push({ role: 'user', text: userText });
    this.userChatInput = '';
    this.isChatLoading = true;

    try {
      // 構建 Prompt
      const systemPrompt = `
        你現在是「洪偉晉」，一位高級軟體工程師。請用第一人稱（我）回答面試官或招聘者的問題。
        請基於以下履歷資料回答，保持專業、自信但謙虛的語氣。用繁體中文回答。
        若被問到履歷上沒有的資訊，請誠實說明或禮貌地將話題引導回你的強項。
        
        履歷資料：
        ${JSON.stringify({ profile: this.profile, experiences: this.experiences, skills: this.skills, educations: this.educations })}
      `;

      const response = await this.callGemini(userText, systemPrompt);
      this.chatMessages.push({ role: 'model', text: response });

    } catch (error) {
      this.chatMessages.push({ role: 'model', text: '抱歉，我現在有點累（連線錯誤），請稍後再試！', isError: true });
      console.error(error);
    } finally {
      this.isChatLoading = false;
    }
  }

  // === Cover Letter Logic ===
  toggleCoverLetterModal() {
    this.isCoverLetterModalOpen = !this.isCoverLetterModalOpen;
  }

  resetCoverLetter() {
    this.generatedCoverLetter = '';
  }

  async generateCoverLetter() {
    if (!this.jobDescription.trim() || this.isCoverLetterLoading) return;

    this.isCoverLetterLoading = true;
    
    try {
       const systemPrompt = `
        你是一位專業的職涯顧問。請根據以下「求職者履歷」與「目標職缺描述 (JD)」，為求職者「洪偉晉」撰寫一封專業、有說服力的求職信 (Cover Letter)。
        
        要求：
        1. 語言：繁體中文。
        2. 格式：標準求職信格式。
        3. 內容策略：強調洪偉晉的技能（如 Vue3, .NET Core, Oracle, ETL 等）如何能解決該 JD 中的具體痛點。
        4. 語氣：熱忱、專業、自信。 
        
        求職者履歷：
        ${JSON.stringify({ profile: this.profile, experiences: this.experiences, skills: this.skills })}
      `;

      const userPrompt = `目標職缺描述 (JD)：\n${this.jobDescription}`;

      const response = await this.callGemini(userPrompt, systemPrompt);
      this.generatedCoverLetter = response;

    } catch (error) {
      console.error(error);
      alert('生成失敗，請稍後再試。');
    } finally {
      this.isCoverLetterLoading = false;
    }
  }

  copyToClipboard() {
    // 使用簡單的 clipboard API (注意：在某些非 https 環境可能受限，但在 immersive 預覽中通常可以)
    const textarea = document.createElement('textarea');
    textarea.value = this.generatedCoverLetter;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    
    // 簡單的 UI 回饋 (這裡用 alert 簡化，實際可用 toast)
    // alert('已複製到剪貼簿！'); 
    // 由於不能用 alert, 我們可以暫時改變按鈕文字或什麼都不做，使用者通常會試著貼上
  }

  // === Gemini API Helper ===
  async callGemini(userText: string, systemInstruction: string): Promise<string> {
    const apiKey = environment.geminiApiKey; // API Key injected by environment
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: userText }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '無回應';
  }

  printResume() {
    window.print();
  }
}
