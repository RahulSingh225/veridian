'use server'

import { put, list } from '@vercel/blob';  // v2.0.0 exports: put, list
type FeedbackType = 'suggestion' | 'bug'

interface Feedback {
  type: FeedbackType
  description: string
  email: string
  timestamp: string
}

 const blobPath = 'feedbacks.json';




export async function submitFeedback(type: FeedbackType, description: string, email: string) {
  try {
    
    const feedback: Feedback = {
      type,
      description,
      email,
      timestamp: new Date().toISOString(),
    }

    

   
   let current: Feedback[] = [];
    const { blobs } = await list({ prefix: blobPath });  // List blobs with prefix (exact match for single file)
    if (blobs.length > 0) {
      const blob = blobs[0];  // Assume single file
      const response = await fetch(blob.url);
      if (response.ok) {
        const content = await response.text();
        current = JSON.parse(content);
      }} // Ignore if not found

    // Append
    const updated = [...current, { ...feedback }];
    
    // Upload new version
    await put(blobPath, JSON.stringify(updated, null, 2), {
      access: 'public', // Or 'public' if needed
    });
    // If you want to sync with Google Sheets, you would add the integration here
    // For now, we'll just save to CSV

    return { success: true }
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return { success: false, error: 'Failed to submit feedback' }
  }
}
