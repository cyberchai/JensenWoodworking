import { NextRequest, NextResponse } from 'next/server';
import { firebaseStore } from '@/lib/firebaseStore';

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('username') as string || formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string || '';
    const budget = formData.get('budget') as string || '';
    const contractorInvolved = formData.get('contractor_involved') as string || 'No';
    const designerInvolved = formData.get('designer_involved') as string || 'No';
    const additionalDetails = formData.get('additional_details') as string || '';
    const mainMessage = formData.get('message') as string;

    // Validate required fields
    if (!name || !email || !mainMessage) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Build comprehensive message with all form data
    let fullMessage = mainMessage;
    
    if (budget) {
      fullMessage += `\n\nBudget: ${budget}`;
    }
    
    if (contractorInvolved === 'Yes' || contractorInvolved === 'true') {
      fullMessage += `\n\nContractor Involved: Yes`;
    }
    
    if (designerInvolved === 'Yes' || designerInvolved === 'true') {
      fullMessage += `\n\nDesigner Involved: Yes`;
    }
    
    if (additionalDetails) {
      fullMessage += `\n\nAdditional Details:\n${additionalDetails}`;
    }

    // Create contact request in Firestore
    await firebaseStore.createContactRequest({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      message: fullMessage.trim(),
    });

    return NextResponse.json(
      { success: true, message: 'Contact request submitted successfully' },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error: any) {
    console.error('Error creating contact request:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit contact request' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}
