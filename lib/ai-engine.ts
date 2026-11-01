import { Student, FacultyStaff, Expense } from './types';
import { MONTH_NAMES } from './data';

export interface LLMResponse {
  answer: string;
  suggestedFollowUps?: string[];
  filterAction?: {
    tab?: string;
    searchQuery?: string;
    filterProgram?: string;
  };
}

export function processAIQuery(query: string, students: Student[], faculty: FacultyStaff[], expenses: Expense[]): LLMResponse {
  const q = query.toLowerCase().trim();

  if (students.length === 0) {
    return {
      answer: '📋 **College Database Status:**\n\nFilhal database mein koi student register nahi hai (tamam dummy records saaf kar diye gaye hain).\n\nAap **"+ Naya Admission Form"** par click karke naya student register kar sakte hain. Uske baad yahan live analytical reports aur fee AI insights available ho jayengi.',
      suggestedFollowUps: ['Naya student kaise add karein?', 'Principal access unlock karein']
    };
  }
  if (
    q.includes('defaulter') || 
    q.includes('unpaid') || 
    q.includes('pending fee') || 
    q.includes('nahi di') || 
    q.includes('rehti hai') || 
    q.includes('baqi') || 
    q.includes('due')
  ) {
    // Check if query is looking for a specific month
    const mentionedMonth = MONTH_NAMES.find(m => q.includes(m.toLowerCase()));
    
    if (mentionedMonth) {
      const yearFilter = q.includes('2025') ? 2025 : (q.includes('2026') ? 2026 : null);
      const studentsMissed = students.filter(s => {
        const matches = s.monthlyFees.filter(m => 
          (m.shortMonth === mentionedMonth || m.monthName.includes(mentionedMonth)) &&
          (!yearFilter || m.year === yearFilter)
        );
        return matches.some(m => m.status === 'DUE' || m.status === 'PARTIAL');
      });
      
      const topList = studentsMissed.slice(0, 8).map(s => {
        const targetRec = s.monthlyFees.find(m => 
          (m.shortMonth === mentionedMonth || m.monthName.includes(mentionedMonth)) && 
          (m.status === 'DUE' || m.status === 'PARTIAL') &&
          (!yearFilter || m.year === yearFilter)
        ) || s.monthlyFees[0];
        return `• **${s.name}** (${s.studentNo} - ${s.program}): ${targetRec.monthName} Status: **${targetRec.status}** (Due: Rs. ${targetRec.payableAmount.toLocaleString()})`;
      }).join('\n');

      return {
        answer: `📊 **${mentionedMonth} ${yearFilter ? yearFilter : '(2-Year)'} Month Defaulter Report:**\n\nTotal **${studentsMissed.length} students** ne ${mentionedMonth} ki fee clear nahi ki (DUE / PARTIAL):\n\n${topList}\n\n${studentsMissed.length > 8 ? `*Aur Mazeed ${studentsMissed.length - 8} students list mein mojood hain.*` : ''}\n\n💡 Aap Defaulters Tab mein filter laga kar poori list export ya WhatsApp reminder generate kar sakte hain.`,
        suggestedFollowUps: [
          `Show Defaulters Tab`,
          `Calculate total outstanding dues for ${mentionedMonth}`,
          `Draft fee reminder SMS for ${mentionedMonth}`
        ],
        filterAction: { tab: 'defaulters', searchQuery: mentionedMonth }
      };
    }

    // General defaulters
    const allDefaulters = students.filter(s => s.unpaidMonthsCount > 0);
    const severeDefaulters = students.filter(s => s.unpaidMonthsCount >= 2);
    const missedMonthsDefaulters = students.filter(s => s.unpaidMonthsCount === 1);

    const topDefaulters = [...allDefaulters].sort((a, b) => (b.currentOverdueAmount ?? b.totalOutstandingAnnual) - (a.currentOverdueAmount ?? a.totalOutstandingAnnual)).slice(0, 6);

    const defaultersList = topDefaulters.map((s, idx) => 
      `${idx + 1}. **${s.name}** (${s.studentNo} | ${s.program})\n   - Overdue Months: **${s.unpaidMonthsCount} Month(s)** (${s.unpaidMonthNames.join(', ')})\n   - Overdue Amount: **Rs. ${(s.currentOverdueAmount ?? s.totalOutstandingAnnual).toLocaleString()}**`
    ).join('\n\n');

    return {
      answer: `📋 **Academic Fee Defaulters & Overdue Summary:**\n\n- **Total Students:** ${students.length}\n- **Total With Overdue Months:** **${allDefaulters.length} Students**\n  - **Chronic Defaulters (2+ Months Overdue):** ${severeDefaulters.length} Students\n  - **1 Month Missed:** ${missedMonthsDefaulters.length} Students\n\n🔥 **Top Overdue Arrears:**\n\n${defaultersList}\n\n📌 **Note:** Future upcoming academic months (Nov '26 onwards) are scheduled in advance and do not count towards defaulter arrears until their billing cycle arrives.`,
      suggestedFollowUps: [
        'Open Defaulters tab with full list',
        'Show students who missed October 2026 fee',
        'Generate official warning notice template'
      ],
      filterAction: { tab: 'defaulters' }
    };
  }

  // 2. Specific student query (Search by name or roll number)
  const matchedStudent = students.find(s => 
    q.includes(s.name.toLowerCase()) || 
    q.includes(s.studentNo.toLowerCase()) ||
    (q.includes('ahmed') && s.studentNo === 'MC-2026-001') ||
    (q.includes('ayesha') && s.studentNo === 'MC-2026-002') ||
    (q.includes('babar') && s.studentNo === 'MC-2026-071')
  );

  if (matchedStudent) {
    const unpaidList = matchedStudent.unpaidMonthsCount > 0 ? matchedStudent.unpaidMonthNames.slice(0, 5).join(', ') + (matchedStudent.unpaidMonthsCount > 5 ? '...' : '') : 'None (All Paid)';
    return {
      answer: `🧑‍⚕️ **Student Profile & Fee Ledger: ${matchedStudent.name}**\n\n- **Student ID:** \`${matchedStudent.studentNo}\`\n- **Father's Name:** ${matchedStudent.fatherName}\n- **Program:** ${matchedStudent.program} (${matchedStudent.yearLevel})\n- **Status:** **${matchedStudent.status}**\n- **Base Monthly Fee:** Rs. ${matchedStudent.monthlyFee.toLocaleString()}\n- **Concession / Scholarship:** ${matchedStudent.concessionType !== 'None' ? `${matchedStudent.concessionType} (${matchedStudent.concessionPercent}%)` : 'None'}\n\n💰 **2-Year Program Financial Standing (24 Months):**\n- **Total Expected 2-Year:** Rs. ${matchedStudent.totalExpectedAnnual.toLocaleString()}\n- **Total Paid to Date:** Rs. ${matchedStudent.totalPaidAnnual.toLocaleString()}\n- **Outstanding Balance:** **Rs. ${matchedStudent.totalOutstandingAnnual.toLocaleString()}**\n- **Unpaid / Due Months (${matchedStudent.unpaidMonthsCount}):** ${unpaidList}\n\n📄 Aap is student ka complete 2-year voucher ya fee statement generate kar sakte hain.`,
      suggestedFollowUps: [
        `Receive fee for ${matchedStudent.name}`,
        `Print fee ledger for ${matchedStudent.name}`,
        `Send WhatsApp alert to ${matchedStudent.name}`
      ],
      filterAction: { tab: 'ledger', searchQuery: matchedStudent.name }
    };
  }

  // 3. Financial revenue, expenses, or faculty salary query
  if (
    q.includes('revenue') || 
    q.includes('collection') || 
    q.includes('finance') || 
    q.includes('expense') || 
    q.includes('salary') || 
    q.includes('budget') || 
    q.includes('kitna paisa')
  ) {
    const totalCollected = students.reduce((acc, s) => acc + s.totalPaidAnnual, 0);
    const totalOutstanding = students.reduce((acc, s) => acc + s.totalOutstandingAnnual, 0);
    const monthlyFacultyPayroll = faculty.reduce((acc, f) => acc + f.netSalary, 0);
    const monthlyExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

    return {
      answer: `💼 **Medical College Executive Financial Overview:**\n\n- **Annual Total Fee Target:** Rs. ${(totalCollected + totalOutstanding).toLocaleString()}\n- **Total Fee Collected To Date:** **Rs. ${totalCollected.toLocaleString()}**\n- **Total Outstanding Balances:** **Rs. ${totalOutstanding.toLocaleString()}**\n\n🏢 **Monthly Operational Costs:**\n- **Faculty & Staff Payroll (Monthly):** Rs. ${monthlyFacultyPayroll.toLocaleString()} (${faculty.length} active doctors/staff)\n- **Operational & Lab Expenses (This Month):** Rs. ${monthlyExpenses.toLocaleString()}\n- **Total Monthly Outflow:** Rs. ${(monthlyFacultyPayroll + monthlyExpenses).toLocaleString()}\n\n📈 **Financial Health Status:** Strong cash flow. Outstanding collection recoveries will further enhance operational surplus.`,
      suggestedFollowUps: [
        'Show detailed Faculty Payroll breakdown',
        'Show Lab & Campus Expenses',
        'View Monthly Collection Chart'
      ],
      filterAction: { tab: 'dashboard' }
    };
  }

  // 4. Policy, Examination, PMDC, or Scholarship rules query
  if (
    q.includes('policy') || 
    q.includes('rule') || 
    q.includes('scholarship') || 
    q.includes('pmdc') || 
    q.includes('exam') || 
    q.includes('admission')
  ) {
    return {
      answer: `🏛️ **Medical College Regulatory & Policy Guidelines (PMDC / HEC Standard):**\n\n1. **Fee Concession & Scholarship Criteria:**\n   - **Merit Scholarship:** Top 5% students with GPA > 3.8 / 80%+ marks get 25% fee waiver.\n   - **Need-Based Aid:** Verified low-income students get 30% to 50% concession on tuition fees.\n   - **Faculty Ward:** 50% waiver for permanent faculty members' children.\n\n2. **Examination Eligibility:**\n   - Minimum **75% clinical & lecture attendance** mandatory.\n   - No outstanding tuition fee dues beyond 30 days prior to annual professional exams.\n\n3. **Late Fee Fine Policy:**\n   - Due date har maheene ki 10 tareeq hoti hai. 10 tareeq ke baad Rs. 100/day fine shamil hota hai.\n   - 2 months lagataar unpaid hone par student portal access temporarily freeze ho jata hai.`,
      suggestedFollowUps: [
        'How many students currently have Merit Scholarship?',
        'Show suspended students list',
        'Fee Structure for MBBS vs BDS'
      ]
    };
  }

  // 5. Letter / Notice / SMS Generator
  if (
    q.includes('letter') || 
    q.includes('notice') || 
    q.includes('sms') || 
    q.includes('whatsapp') || 
    q.includes('message')
  ) {
    return {
      answer: `📝 **Official Fee Defaulter Warning Letter Template:**\n\n\`\`\`\nOFFICE OF THE DIRECTOR FINANCE & STUDENT ACCOUNTS\nXYZ MEDICAL COLLEGE & TEACHING HOSPITAL\n\nRef: MED/FIN/2026/NOT-881                     Date: September 2026\n\nTo: The Parents / Guardian of Student: [Student Name]\nRoll No: [Student ID] | Program: [Program & Year]\n\nSubject: FINAL NOTICE - OUTSTANDING TUITION FEE ARREARS\n\nRespected Parents,\n\nOur financial records indicate that tuition fees for the month(s) of [Unpaid Months] amounting to Rs. [Outstanding Amount] remain unpaid against your ward.\n\nUnder College Regulations and PMDC Examination Guidelines, students with pending dues cannot be cleared for Annual University Examinations or Clinical Rotations.\n\nYou are kindly requested to clear all outstanding dues within seven (7) days via Online Bank Portal or Cashier Counter.\n\nSincerely,\nDirector of Finance & Student Accounts\nXYZ Medical College\n\`\`\`\n\n📲 **SMS / WhatsApp Format:**\n*"Dear Parent, Tuition fee for [Student Name] (Roll: [ID]) for months [Months] of Rs. [Amount] is overdue. Please pay at earliest to avoid late surcharge. Accounts Office."*`,
      suggestedFollowUps: [
        'Apply notice to top 5 defaulters',
        'Export defaulter contact list to Excel',
        'Return to Dashboard'
      ]
    };
  }

  // Default intelligent assistant response
  return {
    answer: `🤖 **Medical College AI Copilot:**\n\nMain aap ke College / School Management System ka intelligent assistant hoon. Main financial records, student ledgers, defaulters list, aur policies ka live tajzia kar sakta hoon.\n\n**Aap mujh se yeh pooch sakte hain:**\n- *"Kaun se 30 students ne fees ada nahi ki?"*\n- *"Un 35 students ki list dikhao jinhon ne March ya August ki fee miss ki hai."*\n- *"Muhammad Ahmed Khan ka 12-month fee record dikhao."*\n- *"Is maheene ki total collection aur faculty salary expense kitna hai?"*\n- *"Defaulters ke liye reminder notice generate karo."*`,
    suggestedFollowUps: [
      'Show 30 pending fee students',
      'Show 35 students with missed months',
      'Summary of total monthly collection',
      'Faculty Payroll status'
    ]
  };
}
