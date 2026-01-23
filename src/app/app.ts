import { Component, signal, computed, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Experience, Education, SkillGroup, ChatMessage } from './interfaces';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  currentYear = new Date().getFullYear();

  // === 履歷資料 ===
  profile = {
    name: '洪偉晉',
    title: '高級工程師',
    email: 'fubit1994@gmail.com',
    phone: '0927-275-816',
    location: '台南市歸仁區',
    age: 31,
    military: '役畢',
    totalExp: '7-8 年工作經歷',
    bio: '我是 Jim, 一名擁有 7 至 8 年實戰經驗的軟體工程師, 擅長利用 .NET 與 Vue 等現代化框架建構系統。同時也不排斥 JAVA、Python 等各種程式語言, 目前正積極投入 Angular 的自學, 喜歡靈活思考、挑戰各種技術難題。',
    assets:'/assets/img/7562.JPG'
  };

  autobiography = [
    {
      title: '職涯核心價值: 數據驅動與問題解決',
      content: '我是一名擁有 7 至 8 年實戰經驗的軟體工程師，擅長利用 .NET 與 Vue 等現代化框架建構系統。我的職涯核心理念深受指導教授黃仁鵬先生的教育理念——「培養帶得走的能力」所影響。這使我在面對快速更迭的技術環境時，能保持獨立思考、快速對接商業需求，並將技術轉化為實際的產能價值。'
    },
    {
      title: '學術研究: 大數據與情感分析專長',
      content: '在研究所時期，我專攻資料探勘、資料庫系統及大數據分析。我的碩士論文《社群網路輿情之情感分析——以 Dcard 為例》，成功開發出一套自動化情感分析系統。該系統能透過爬蟲精準捕捉網路輿情，為決策者提供數據支持，大幅取代了繁瑣的人力標記工作。'
    },
    {
      title: '工作經歷: 從老舊系統維護到雲端架構開發',
      content: '在過去多年的職涯中，我經歷了從傳統架構到現代雲端化部署的完整蛻變。在群創光電，我主導 Vue 3 前端與 .NET 6 API 後端開發，並推動模듈화設計與 CI/CD 自動化流程；在此之前，也處理過 JSP 系統升級、VBA 效能調校，並在漢龍資訊負責 .NET MVC 系統開發，具備從需求分析到專案交付的完整經驗。'
    },
    {
      title: '團隊協作與人際圓融',
      content: '身為家庭中的老么，我具備高度的親和力與彈性。在職場中，我深諳「軟體開發是團隊運動」的道理。無論是擔任外包開發還是內部工程師，我都能以圓融的溝通技巧與跨部門同仁協作，確保技術方案能精準對接使用者需求，並在壓力下保持專業與穩定。'
    },
    {
      title: '未來展望',
      content: '我從不滿足於現狀，目前正積極精進 Angular 框架，期許自己成為更全面的多框架技術專家。憑藉著多年累積的技術廣度、大數據分析的敏銳度，以及對解決問題的熱忱，我深信自己能為貴團隊帶來實質的技術貢獻與正向能量。期待有機會與您進一步交流，分享我能為貴公司創造的價值。'
    }
  ];

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

  // === Autobiography Logic ===
  isAutobiographyOpen = false;

  toggleAutobiography() {
    this.isAutobiographyOpen = !this.isAutobiographyOpen;
  }

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

  printResume() {
    window.print();
  }
}
