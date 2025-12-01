import { NextRequest, NextResponse } from 'next/server'
import { logApiCall } from '@/lib/log-api-call'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { to, recipient, occasion, letter, user_id } = body

    if (!to || !recipient || !letter) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // 使用 Resend API 发送邮件
    // 如果没有配置 RESEND_API_KEY，则返回错误提示
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email service not configured. Please set RESEND_API_KEY environment variable.' 
        },
        { status: 500 }
      )
    }

    // 构建邮件内容
    const emailSubject = `Letter from MuseAIWrite: To ${recipient}`
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .letter-box { background: #fff; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; white-space: pre-wrap; font-family: 'Courier New', monospace; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 A Letter from MuseAIWrite</h1>
            </div>
            <div class="content">
              <p><strong>To:</strong> ${recipient}</p>
              ${occasion ? `<p><strong>Occasion:</strong> ${occasion}</p>` : ''}
              <div class="letter-box">${letter.replace(/\n/g, '<br>')}</div>
              <div class="footer">
                <p>Created with MuseAIWrite ✨</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const emailText = `Letter from MuseAIWrite

To: ${recipient}
${occasion ? `Occasion: ${occasion}\n` : ''}

${letter}

---
Created with MuseAIWrite
    `

    // 发送邮件
    try {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'MuseAIWrite <noreply@museaiwrite.com>', // 需要配置发送域名
          to: [to],
          subject: emailSubject,
          html: emailHtml,
          text: emailText,
        }),
      })

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json()
        console.error('Resend API error:', errorData)
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to send email: ${errorData.message || 'Unknown error'}` 
          },
          { status: resendResponse.status }
        )
      }

      const resendData = await resendResponse.json()
      console.log('Email sent successfully:', resendData)

      // 记录 API 调用
      try {
        await logApiCall(
          user_id,
          'sendLetterEmail',
          '/api/send-letter-email',
          { to, recipient, occasion },
          { success: true, emailId: resendData.id }
        )
      } catch (logError) {
        console.error('Error logging API call:', logError)
      }

      return NextResponse.json({
        success: true,
        message: 'Email sent successfully',
        emailId: resendData.id,
      })
    } catch (fetchError) {
      console.error('Error calling Resend API:', fetchError)
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to send email: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}` 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}


