import { Component, signal, computed, inject, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 定義資料介面
interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  type: string;
  description: string[];
  techStack: string[];
}

interface Education {
  school: string;
  degree: string;
  period: string;
  department: string;
}

interface SkillGroup {
  category: string;
  items: { name: string; level: number }[]; 
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12 print:bg-white print:pb-0 relative">
      
      <!-- 導航/動作列 (列印時隱藏) -->
      <nav class="fixed top-0 right-0 p-4 z-50 print:hidden flex gap-3 flex-wrap justify-end pointer-events-none">
        <!-- 按鈕容器，恢復 pointer-events -->
        <div class="pointer-events-auto flex gap-3">
            <!-- ✨ 產生求職信按鈕 -->
            <button 
            (click)="toggleCoverLetterModal()"
            class="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 font-medium border border-purple-400/30 backdrop-blur-sm">
            <span class="text-lg">✨</span>
            為我撰寫求職信
            </button>

            <!-- 列印按鈕 -->
            <button 
            (click)="printResume()"
            class="bg-white/90 hover:bg-white text-slate-700 border border-slate-200 px-5 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 font-medium backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
            列印 / 下載 PDF
            </button>
        </div>
      </nav>

      <!-- Header / Hero Section -->
      <header class="bg-gradient-to-r from-slate-800 to-slate-900 text-white pt-24 pb-16 px-4 shadow-xl print:pt-8 print:pb-8 print:bg-none print:text-black print:shadow-none">
        <div class="max-w-4xl mx-auto grid md:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div class="inline-block bg-blue-500 text-xs font-bold px-3 py-1 rounded-full mb-3 tracking-wider uppercase shadow-sm print:border print:border-gray-300 print:text-black print:bg-transparent">
              Senior Software Engineer
            </div>
            <h1 class="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{{ profile.name }}</h1>
            <h2 class="text-xl md:text-2xl text-blue-200 font-light mb-6 print:text-gray-600">{{ profile.title }}</h2>
            
            <div class="flex flex-wrap gap-y-3 gap-x-6 text-sm text-slate-300 print:text-gray-700">
              <div class="flex items-center gap-2">
                <span class="icon">📧</span>
                <a [href]="'mailto:' + profile.email" class="hover:text-white transition-colors border-b border-transparent hover:border-white">{{ profile.email }}</a>
              </div>
              <div class="flex items-center gap-2">
                <span class="icon">📱</span>
                <span>{{ profile.phone }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="icon">📍</span>
                <span>{{ profile.location }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="icon">🎂</span>
                <span>{{ profile.age }}歲 ({{ profile.military }})</span>
              </div>
            </div>
          </div>
          
          <!-- 大頭貼 placeholder -->
          <div class="hidden md:block print:hidden">
            <div class="w-32 h-32 rounded-full bg-slate-700 border-4 border-slate-600 flex items-center justify-center text-3xl font-bold text-slate-500 shadow-inner relative overflow-hidden group">
                <span class="group-hover:scale-110 transition-transform duration-500 block">洪</span>
                <!-- AI Badge -->
                <div class="absolute bottom-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" title="AI Online"></div>
            </div>
          </div>
        </div>
      </header>

      <main class="max-w-4xl mx-auto px-4 -mt-8 space-y-12 print:mt-4 print:space-y-8">

        <!-- 簡介 (About) -->
        <section class="bg-white rounded-xl shadow-sm p-8 border-l-4 border-blue-500 print:shadow-none print:border-l-2 print:p-0 print:mb-6">
          <h3 class="section-title">關於我</h3>
          <p class="text-slate-600 leading-relaxed text-justify print:text-gray-800">
            {{ profile.bio }}
          </p>
          <div class="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-4 print:hidden">
            <div class="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
              🚀 專長：全端開發 (.NET Core + Vue3)
            </div>
            <div class="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium">
              📊 資料庫：Oracle / Greenplum / ETL
            </div>
            <div class="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">
              🌱 目前進修：Angular
            </div>
          </div>
        </section>

        <div class="grid md:grid-cols-[2fr_1fr] gap-8 print:block">
          
          <!-- 左欄：工作經歷與學歷 -->
          <div class="space-y-12 print:space-y-8">
            
            <!-- 工作經歷 -->
            <section>
              <h3 class="section-title flex items-center gap-3 mb-6">
                <span class="bg-blue-100 text-blue-600 p-2 rounded-lg print:hidden">💼</span>
                工作經歷 <span class="text-sm font-normal text-slate-400 ml-auto">{{ profile.totalExp }}</span>
              </h3>
              
              <div class="relative border-l-2 border-slate-200 ml-3 space-y-10 pb-4 print:border-l-0 print:ml-0 print:space-y-6">
                
                @for (job of experiences; track job.company) {
                  <div class="relative pl-8 print:pl-0">
                    <!-- Timeline Dot -->
                    <div class="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500 print:hidden"></div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-baseline justify-between mb-2 print:border-b print:border-gray-300 print:pb-1">
                      <h4 class="text-xl font-bold text-slate-800">{{ job.company }}</h4>
                      <span class="text-sm font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded print:bg-transparent print:text-gray-600 print:p-0">
                        {{ job.period }}
                      </span>
                    </div>
                    
                    <div class="mb-3 flex items-center gap-2 text-blue-600 font-medium">
                      <span>{{ job.role }}</span>
                      <span class="text-slate-300">•</span>
                      <span class="text-sm text-slate-500">{{ job.location }}</span>
                    </div>

                    <ul class="list-disc list-outside ml-4 space-y-2 text-slate-600 mb-4 text-sm leading-relaxed print:text-gray-800">
                      @for (desc of job.description; track desc) {
                        <li>{{ desc }}</li>
                      }
                    </ul>

                    <div class="flex flex-wrap gap-2 print:mt-2">
                      @for (tech of job.techStack; track tech) {
                        <span class="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded border border-slate-200 print:border-gray-400">#{{ tech }}</span>
                      }
                    </div>
                  </div>
                }

              </div>
            </section>

            <!-- 學歷 -->
            <section class="break-inside-avoid">
              <h3 class="section-title flex items-center gap-3 mb-6">
                <span class="bg-blue-100 text-blue-600 p-2 rounded-lg print:hidden">🎓</span>
                學歷
              </h3>
              <div class="grid gap-4">
                @for (edu of educations; track edu.degree) {
                  <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-shadow print:shadow-none print:border-0 print:border-b print:border-gray-200 print:rounded-none print:p-2">
                    <div>
                      <h4 class="font-bold text-slate-800">{{ edu.school }}</h4>
                      <div class="text-slate-600 text-sm">{{ edu.department }} <span class="text-blue-600 font-medium">| {{ edu.degree }}</span></div>
                    </div>
                    <div class="text-right text-sm text-slate-400 print:text-gray-600">
                      {{ edu.period }}
                    </div>
                  </div>
                }
              </div>
            </section>
          </div>

          <!-- 右欄：技能與證照 -->
          <div class="space-y-12 print:mt-8 print:space-y-8">
            
            <!-- 專業技能 -->
            <section class="break-inside-avoid">
              <h3 class="section-title flex items-center gap-3 mb-6">
                <span class="bg-blue-100 text-blue-600 p-2 rounded-lg print:hidden">⚡</span>
                專業技能
              </h3>
              
              <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-8 print:shadow-none print:border-gray-200">
                @for (group of skills; track group.category) {
                  <div>
                    <h5 class="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider border-b border-slate-100 pb-1">{{ group.category }}</h5>
                    <div class="space-y-3">
                      @for (item of group.items; track item.name) {
                        <div>
                          <div class="flex justify-between text-sm mb-1">
                            <span class="font-medium text-slate-700">{{ item.name }}</span>
                            <!-- 數值在列印時隱藏，只顯示文字 -->
                          </div>
                          <div class="h-2 bg-slate-100 rounded-full overflow-hidden print:border print:border-gray-300">
                            <div class="h-full bg-blue-500 rounded-full" [style.width.%]="item.level"></div>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            </section>

            <!-- 語言能力 -->
            <section class="break-inside-avoid">
              <h3 class="section-title flex items-center gap-3 mb-6">
                <span class="bg-blue-100 text-blue-600 p-2 rounded-lg print:hidden">🌐</span>
                語言能力
              </h3>
              <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid grid-cols-2 gap-4 print:shadow-none print:border-gray-200">
                 <div class="text-center p-3 bg-slate-50 rounded-lg print:bg-white print:border print:border-gray-200">
                   <div class="font-bold text-slate-800">中文</div>
                   <div class="text-xs text-slate-500">精通</div>
                 </div>
                 <div class="text-center p-3 bg-slate-50 rounded-lg print:bg-white print:border print:border-gray-200">
                   <div class="font-bold text-slate-800">英文</div>
                   <div class="text-xs text-slate-500">略懂 (讀寫)</div>
                 </div>
                 <div class="text-center p-3 bg-slate-50 rounded-lg print:bg-white print:border print:border-gray-200">
                   <div class="font-bold text-slate-800">日文</div>
                   <div class="text-xs text-slate-500">略懂</div>
                 </div>
                 <div class="text-center p-3 bg-slate-50 rounded-lg print:bg-white print:border print:border-gray-200">
                   <div class="font-bold text-slate-800">台語</div>
                   <div class="text-xs text-slate-500">中等</div>
                 </div>
              </div>
            </section>

             <!-- 證照 -->
             <section class="break-inside-avoid">
              <h3 class="section-title flex items-center gap-3 mb-6">
                <span class="bg-blue-100 text-blue-600 p-2 rounded-lg print:hidden">📜</span>
                專業證照
              </h3>
              <ul class="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-3 text-sm text-slate-600 print:shadow-none print:border-gray-200">
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span> 丙級工業電子技術士
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span> TQC 動態網頁程式設計 PHP5
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-green-500 mt-0.5">✓</span> TQC-DK 專案管理概論
                </li>
              </ul>
            </section>

          </div>
        </div>

        <!-- Footer -->
        <footer class="text-center text-slate-400 text-sm py-8 border-t border-slate-200 print:hidden">
          <p>© {{ currentYear }} 洪偉晉. Designed with Angular & Tailwind CSS & Gemini API.</p>
        </footer>

      </main>

      <!-- 🤖 AI Chat Widget (AI 虛擬分身) -->
      <div class="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end">
        
        <!-- Chat Window -->
        @if (isChatOpen) {
          <div class="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col mb-4 overflow-hidden border border-slate-200 animate-fade-in-up h-[500px] max-h-[80vh]">
            <!-- Chat Header -->
            <div class="bg-slate-800 text-white p-4 flex justify-between items-center">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">洪</div>
                <div>
                  <div class="font-bold text-sm">洪偉晉 (AI)</div>
                  <div class="text-xs text-blue-200 flex items-center gap-1">
                    <span class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                  </div>
                </div>
              </div>
              <button (click)="toggleChat()" class="text-slate-400 hover:text-white p-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <!-- Chat Messages -->
            <div #chatContainer class="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              @if (chatMessages.length === 0) {
                <div class="text-center text-slate-400 my-8 text-sm">
                  <p>👋 你好！我是偉晉的 AI 分身。</p>
                  <p class="mt-2">您可以問我關於他的經歷、技術棧，或請我自我介紹！</p>
                  <div class="mt-4 flex flex-wrap justify-center gap-2">
                    <button (click)="quickAsk('請簡單自我介紹')" class="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">請簡單自我介紹</button>
                    <button (click)="quickAsk('你熟悉 Vue 3 嗎？')" class="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">你熟悉 Vue 3 嗎？</button>
                    <button (click)="quickAsk('說明你在群創光電的工作')" class="text-xs bg-white border border-slate-200 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-blue-600 transition">說明在群創的工作</button>
                  </div>
                </div>
              }
              
              @for (msg of chatMessages; track msg) {
                <div class="flex" [ngClass]="{'justify-end': msg.role === 'user', 'justify-start': msg.role === 'model'}">
                  <div class="max-w-[85%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm"
                    [ngClass]="{
                      'bg-blue-600 text-white rounded-br-none': msg.role === 'user',
                      'bg-white text-slate-700 rounded-bl-none border border-slate-100': msg.role === 'model',
                      'bg-red-50 text-red-600 border border-red-100': msg.isError
                    }">
                    {{ msg.text }}
                  </div>
                </div>
              }

              @if (isChatLoading) {
                <div class="flex justify-start">
                  <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex gap-1">
                    <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                    <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                    <span class="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                  </div>
                </div>
              }
            </div>

            <!-- Chat Input -->
            <div class="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                [(ngModel)]="userChatInput" 
                (keyup.enter)="sendMessage()"
                [disabled]="isChatLoading"
                type="text" 
                placeholder="輸入問題..." 
                class="flex-1 bg-slate-100 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-60"
              >
              <button 
                (click)="sendMessage()"
                [disabled]="!userChatInput.trim() || isChatLoading"
                class="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        }

        <!-- Chat Toggle Button -->
        <button (click)="toggleChat()" class="bg-slate-800 hover:bg-slate-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border-2 border-white">
          @if (isChatOpen) {
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          }
        </button>
      </div>

      <!-- ✨ Cover Letter Modal (求職信產生器) -->
      @if (isCoverLetterModalOpen) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
          <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" (click)="toggleCoverLetterModal()"></div>
          <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] animate-fade-in-up">
            
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-xl font-bold flex items-center gap-2">✨ AI 智慧求職信產生器</h3>
                  <p class="text-purple-200 text-sm mt-1">貼上職缺描述 (JD)，讓 Gemini 為我撰寫專屬的 Cover Letter</p>
                </div>
                <button (click)="toggleCoverLetterModal()" class="text-purple-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            </div>

            <div class="p-6 overflow-y-auto">
              @if (!generatedCoverLetter) {
                <div class="space-y-4">
                  <label class="block text-sm font-medium text-slate-700">職缺描述 (Job Description)</label>
                  <textarea 
                    [(ngModel)]="jobDescription"
                    class="w-full h-40 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none text-slate-600 placeholder:text-slate-400 bg-slate-50"
                    placeholder="請在此貼上您想應徵的職位描述... 例如：我們正在尋找一位熟悉 .NET Core 和 Angular 的資深工程師..."
                  ></textarea>
                  
                  <button 
                    (click)="generateCoverLetter()"
                    [disabled]="!jobDescription.trim() || isCoverLetterLoading"
                    class="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-md shadow-purple-200">
                    @if (isCoverLetterLoading) {
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      AI 撰寫中...
                    } @else {
                      ✨ 立即生成
                    }
                  </button>
                </div>
              } @else {
                <div class="space-y-4">
                  <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold text-slate-800">您的專屬求職信</h4>
                    <div class="flex gap-2">
                       <button (click)="copyToClipboard()" class="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-lg transition">複製內容</button>
                       <button (click)="resetCoverLetter()" class="text-xs text-slate-400 hover:text-purple-600 px-3 py-1">重寫</button>
                    </div>
                  </div>
                  <div class="bg-slate-50 p-6 rounded-xl border border-slate-200 text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-serif">
                    {{ generatedCoverLetter }}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      --primary-color: #3b82f6;
      --text-dark: #1e293b;
    }

    .section-title {
      @apply text-2xl font-bold text-slate-800;
    }

    /* 動畫 */
    @keyframes fade-in-up {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.3s ease-out forwards;
    }

    @media print {
      @page { margin: 1cm; size: auto; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      section, .break-inside-avoid { break-inside: avoid; }
      .shadow-xl, .shadow-sm, .shadow-lg { box-shadow: none !important; }
    }
    
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: #f1f5f9; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `]
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
    const apiKey = ""; // API Key injected by environment
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