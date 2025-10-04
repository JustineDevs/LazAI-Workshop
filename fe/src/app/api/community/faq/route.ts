import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const query = searchParams.get('query') || '';

    // Mock FAQ data
    const faqs = [
      {
        id: '1',
        question: 'What is DataStreamNFT?',
        answer: 'DataStreamNFT is a platform for monetizing data through AI queries on the blockchain. You can upload your data, encrypt it, and earn from AI agents that query it.',
        category: 'General'
      },
      {
        id: '2',
        question: 'How do I mint a DAT?',
        answer: 'You can mint a Data Anchoring Token (DAT) by encrypting your data and uploading it via the "Upload Data" page. Set your query price and metadata.',
        category: 'Minting'
      },
      {
        id: '3',
        question: 'How do I earn from my data?',
        answer: 'When AI agents query your minted DATs, you receive micropayments in ETH automatically. Track your earnings on the dashboard.',
        category: 'Earnings'
      },
      {
        id: '4',
        question: 'Is my data private?',
        answer: 'Yes, all data is end-to-end encrypted before being uploaded to IPFS, and only accessible with your decryption key.',
        category: 'Privacy'
      },
      {
        id: '5',
        question: 'What is LazAI?',
        answer: 'LazAI is an AI inference engine integrated with DataStreamNFT to enable powerful queries on your data.',
        category: 'AI Integration'
      }
    ];

    // Filter by category and search query
    let filteredFaqs = faqs;
    if (category !== 'all') {
      filteredFaqs = filteredFaqs.filter(faq => faq.category.toLowerCase() === category.toLowerCase());
    }
    if (query) {
      const lowerCaseQuery = query.toLowerCase();
      filteredFaqs = filteredFaqs.filter(faq =>
        faq.question.toLowerCase().includes(lowerCaseQuery) ||
        faq.answer.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return NextResponse.json({ success: true, data: filteredFaqs });
  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
