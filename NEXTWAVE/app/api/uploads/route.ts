import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 })
    }

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await fs.mkdir(uploadDir, { recursive: true })

    const urls: string[] = []

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const ext = path.extname(file.name) || '.jpg'
      const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`
      const filePath = path.join(uploadDir, name)
      await fs.writeFile(filePath, buffer)
      urls.push(`/uploads/${name}`)
    }

    return NextResponse.json({ urls }, { status: 201 })
  } catch (e) {
    console.error('Upload error', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
