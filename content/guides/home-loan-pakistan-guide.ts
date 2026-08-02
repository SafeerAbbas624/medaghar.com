import type { Guide } from './types'

const guide: Guide = {
  slug: 'home-loan-pakistan-guide',
  title: 'Home Loan in Pakistan: Complete Guide to House Financing (2026)',
  description:
    'How home loans work in Pakistan in 2026: Islamic vs conventional financing, KIBOR-linked rates, eligibility, down payment, documents and approval tips.',
  category: 'Home Financing',
  keywords: [
    'home loan in pakistan',
    'house loan eligibility pakistan',
    'meezan easy home requirements',
    'home loan interest rate pakistan',
    'islamic home financing pakistan',
    'hbfc house loan',
    'home loan calculator pakistan',
  ],
  publishedAt: '2026-06-12',
  updatedAt: '2026-06-12',
  readTimeMinutes: 10,
  related: ['first-time-home-buyer-guide-pakistan', 'property-taxes-pakistan', 'how-to-verify-property-documents'],
  faqs: [
    {
      question: 'How much salary is required for a home loan in Pakistan?',
      answer:
        'Most banks ask for a minimum net monthly income of PKR 75,000 to 150,000 for salaried applicants, but the real test is the debt-burden ratio: your total monthly instalments, including the new one, should stay within roughly 40-50% of net income. A PKR 200,000 salary with no other loans can typically support an instalment of PKR 80,000-100,000.',
    },
    {
      question: 'What is the difference between a conventional home loan and Islamic home financing?',
      answer:
        'A conventional loan charges markup (interest) on a lent amount. Islamic financing, usually diminishing musharakah, makes the bank a co-owner of the house: you pay rent on the bank’s share and buy out its units over time until you own 100%. The monthly payment is comparable, but the contract structure, late-payment treatment and Shariah compliance differ.',
    },
    {
      question: 'How much down payment is required for a house loan in Pakistan?',
      answer:
        'Typically 15-30% of the property value. Banks finance 70-85% (the loan-to-value ratio), and the percentage is usually lower for self-employed applicants, for construction financing and for properties in less established areas. On a PKR 2 crore house, expect to bring at least PKR 30-60 lakh yourself, plus transaction costs.',
    },
    {
      question: 'Can overseas Pakistanis get a home loan from Pakistani banks?',
      answer:
        'Yes. Meezan, HBL, Bank Alfalah and several others run dedicated non-resident home finance products, often tied to Roshan Digital Account holders. Income is assessed from foreign salary documents, and a local co-borrower or power of attorney is usually needed for property handling.',
    },
    {
      question: 'What is the current home loan interest rate in Pakistan?',
      answer:
        'Rates float with KIBOR, which tracks the State Bank policy rate, so they change frequently. Banks price home finance at 1-year KIBOR plus a spread of roughly 2-4%. As of early 2026 that puts effective rates broadly in the low-to-mid teens, but always check the live rate with the bank before planning, and stress-test your instalment for a 2-3% rise.',
    },
    {
      question: 'How long does home loan approval take in Pakistan?',
      answer:
        'From complete application to disbursement, plan for 4-8 weeks. Income verification and the bank’s legal and valuation checks on the property are the slowest steps. Incomplete property documents are the most common cause of delay, so have the title chain ready before you apply.',
    },
  ],
  html: `
<p>Buying a house on bank financing is still the exception in Pakistan, not the rule. Mortgage debt is barely a quarter of one percent of GDP, against 80% plus in developed markets. That is changing slowly: Islamic banks have made home finance respectable for families who refused interest-based loans, and a generation priced out of cash purchases is doing the math on financing instead of rent. This guide walks through how the system actually works, who qualifies, what it costs beyond the headline rate, and how to get approved on the first attempt.</p>

<h2>How does home financing work in Pakistan?</h2>
<p>There are two parallel systems, and the split matters more here than almost anywhere else in the world.</p>

<h3>Conventional home loans: KIBOR plus spread</h3>
<p>A conventional bank lends you money and charges markup on the outstanding balance. Pricing is almost always floating: the bank takes 1-year KIBOR (the Karachi Interbank Offered Rate, which moves with the State Bank of Pakistan policy rate) and adds a spread, typically 2% to 4%. When the SBP cuts the policy rate, your instalment falls at the next reset; when it hikes, your instalment rises. Anyone who held a mortgage through the 22% policy-rate peak of 2023-24 felt this painfully, and anyone who financed during the easing cycle since has felt the relief. The lesson: never size your budget on today’s rate alone.</p>

<h3>Islamic home financing: diminishing musharakah</h3>
<p>Islamic banks do not lend money. Instead, under <strong>diminishing musharakah</strong>, the bank and you jointly buy the property. If you bring 30% and the bank brings 70%, the house is split into ownership units in that ratio. Each month you pay two things: rent on the bank’s share of the house, plus the purchase price of one or more of the bank’s units. As you buy units, the bank’s share shrinks, the rent component falls, and eventually you own 100%. The rental benchmark is still linked to KIBOR, so the monthly cost tracks the same market rates, but the contract is asset-backed and Shariah-board approved.</p>
<p><strong>Meezan Bank’s Easy Home</strong> is the clear market leader by portfolio size, and for many buyers Islamic financing is the only acceptable route. Practical differences worth knowing: late payments go to charity rather than compounding as penal interest, early buyout terms are often friendlier, and property takaful replaces conventional insurance.</p>

<h2>Which banks offer home loans in Pakistan?</h2>
<table>
<thead><tr><th>Provider</th><th>Product</th><th>Type</th><th>Known for</th></tr></thead>
<tbody>
<tr><td>Meezan Bank</td><td>Easy Home</td><td>Islamic (diminishing musharakah)</td><td>Largest home finance portfolio in the country; buy, build, renovate and balance-transfer variants</td></tr>
<tr><td>HBL</td><td>HomeValue</td><td>Conventional (Islamic via HBL Islamic)</td><td>Wide branch network, strong salaried-segment processing</td></tr>
<tr><td>Bank Alfalah</td><td>Alfalah Home Finance</td><td>Both windows</td><td>Competitive spreads, non-resident options</td></tr>
<tr><td>MCB</td><td>MCB Home Loan</td><td>Conventional</td><td>Established processing in major cities</td></tr>
<tr><td>Faysal Bank</td><td>Faysal Islami Home Finance</td><td>Islamic (full bank conversion)</td><td>Fully Shariah-compliant institution since conversion</td></tr>
<tr><td>HBFC</td><td>Ghar Pakistan and others</td><td>Specialised housing finance</td><td>The state-backed housing lender; smaller ticket sizes, lower-income segments</td></tr>
</tbody>
</table>
<p>Spreads, maximum financing limits and processing quality differ meaningfully between banks, so collect at least three quotes. You can compare current offers on our <a href="/home-loans">home loans page</a> and model any of them in the <a href="/tools/mortgage-calculator">mortgage calculator</a> before you talk to a branch.</p>

<h2>Who is eligible for a home loan in Pakistan?</h2>
<p>Banks underwrite three things: your income, your age, and the property itself.</p>
<ul>
<li><strong>Salaried applicants</strong> need a permanent job, usually 2 years of total employment with 6-12 months at the current employer, and salary credited through a bank account. Minimum net income requirements commonly start around PKR 75,000-150,000 per month depending on bank and city.</li>
<li><strong>Self-employed and business owners</strong> face a higher bar: typically 3 years of business continuity, tax returns, bank statements showing consistent deposits, and often a slightly lower loan-to-value cap. Undocumented cash income is the single biggest reason business applicants get rejected, so route your revenue through banking channels for at least a year before applying.</li>
<li><strong>Debt-burden ratio (DBR)</strong> is the deciding arithmetic. Your total monthly obligations, including the proposed instalment, car loans and credit card minimums, must stay within roughly 40-50% of verifiable net income. Earn PKR 300,000 net with a PKR 40,000 car instalment, and a bank applying a 45% DBR will allow a housing instalment of about PKR 95,000.</li>
<li><strong>Age limits:</strong> usually 25 at application, with the loan ending by 60-65 for salaried borrowers (retirement) and up to 70 for self-employed. A 50-year-old salaried applicant may be offered only a 10-12 year tenor, which raises the instalment sharply.</li>
</ul>

<h2>Tenor, down payment and what a loan really looks like</h2>
<p>Tenors run from 3 to 25 years. Longer tenors cut the instalment but multiply total markup paid; most borrowers land between 10 and 20 years. Down payment is typically <strong>15-30%</strong> of the bank-assessed value, not your negotiated price, and the bank finances the lower of the two.</p>
<p>A concrete example, using indicative early-2026 numbers: a PKR 2.5 crore house in Lahore with 25% down means financing PKR 1.875 crore. At an effective rate in the low teens over 20 years, the starting instalment lands roughly in the PKR 210,000-230,000 range, requiring a net household income around PKR 450,000-550,000 to pass DBR. Run your own figures in the <a href="/tools/mortgage-calculator">mortgage calculator</a>; small changes in rate or tenor move the instalment more than most people expect.</p>

<h2>Documents required for a house loan</h2>
<ul>
<li>CNIC copies of applicant and co-applicant</li>
<li>Salaried: salary slips (last 3-6 months), employer letter, bank statement (12 months)</li>
<li>Self-employed: tax returns (2-3 years), bank statements (12-24 months), business registration or partnership deed, professional association membership where relevant</li>
<li>Property: complete title chain, allotment or transfer letter, approved building plan, society NOC, latest tax receipts</li>
<li>Existing loan statements, if any</li>
</ul>
<p>The bank will run its own legal opinion on the title and send an approved valuer to assess the property. If you have not already verified the documents yourself, do it first; our guide on <a href="/guides/how-to-verify-property-documents">how to verify property documents</a> covers the full checklist, and a title defect discovered at the bank’s legal stage usually kills the deal after you have paid the processing fee.</p>

<h2>The process, step by step</h2>
<ol>
<li><strong>Pre-qualification:</strong> share income details, get an indicative financing limit. Do this before house-hunting, not after.</li>
<li><strong>Application and processing fee:</strong> submit documents; the fee (commonly PKR 10,000-25,000 plus valuation charges) is non-refundable.</li>
<li><strong>Income and credit verification:</strong> the bank checks your eCIB credit report and verifies employment or business.</li>
<li><strong>Property legal opinion and valuation:</strong> the bank’s lawyer vets the title; its valuer assesses market value, which caps the financing.</li>
<li><strong>Approval and offer letter:</strong> review the rate, spread, reset frequency and early-settlement terms before signing.</li>
<li><strong>Documentation and mortgage creation:</strong> financing agreement, property mortgaged in the bank’s favour at the registrar or society office.</li>
<li><strong>Disbursement:</strong> the bank pays the seller directly, usually at transfer.</li>
</ol>

<h2>Costs beyond the markup rate</h2>
<table>
<thead><tr><th>Cost</th><th>Typical range (indicative)</th><th>When paid</th></tr></thead>
<tbody>
<tr><td>Processing fee</td><td>PKR 10,000-25,000</td><td>At application, non-refundable</td></tr>
<tr><td>Valuation and legal charges</td><td>PKR 10,000-30,000</td><td>During processing</td></tr>
<tr><td>Property takaful / insurance</td><td>~0.1-0.2% of property value per year</td><td>Annually, for the loan life</td></tr>
<tr><td>Life takaful / coverage</td><td>~0.2-0.5% of outstanding per year</td><td>Annually; clears the loan if the borrower dies</td></tr>
<tr><td>Mortgage registration and stamp charges</td><td>Varies by province</td><td>At mortgage creation</td></tr>
</tbody>
</table>
<p>Add the normal purchase taxes on top: advance tax, stamp duty and transfer fees apply whether or not you finance. See our breakdown of <a href="/guides/property-taxes-pakistan">property taxes in Pakistan</a> for those.</p>

<h2>How to improve your approval odds</h2>
<ul>
<li><strong>Clean your eCIB record</strong> 6-12 months before applying. Settle overdue cards; even small defaults flag the file.</li>
<li><strong>Bank your income.</strong> Cash salaries and cash business takings do not count. Get salary transferred, deposit business revenue consistently.</li>
<li><strong>File tax returns.</strong> Being on the Active Taxpayers List lowers your withholding taxes on the purchase and strengthens the application.</li>
<li><strong>Add a co-borrower.</strong> A spouse’s income can lift the DBR ceiling substantially.</li>
<li><strong>Choose a clean-title property in an approved society.</strong> Banks decline more files over property issues than income issues.</li>
<li><strong>Apply where you bank.</strong> Your salary bank already trusts your cash flow and often processes faster.</li>
</ul>

<h2>A note on rates: do not anchor on today’s number</h2>
<p>Every rate in this guide is indicative. Home finance pricing in Pakistan resets with KIBOR, usually annually, and KIBOR follows the SBP policy rate, which has swung by more than 10 percentage points within a few years in the recent past. Before signing, ask the bank for the exact spread, the reset frequency, and an amortisation schedule at the current rate plus a stress case 3% higher. If the stressed instalment breaks your budget, borrow less or extend the tenor. Then start your search on our <a href="/buy">buy listings</a> knowing precisely what you can afford.</p>
`,
}

export default guide
