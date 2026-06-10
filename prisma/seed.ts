import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(process.cwd(), 'informacion', 'trabajadores.md')
  
  let fileContent = ''
  try {
    fileContent = fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`No se pudo leer el archivo ${filePath}.`)
    return
  }

  // Separar los trabajadores por "---"
  const blocks = fileContent.split('---').map(b => b.trim()).filter(b => b.length > 0)

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim())
    let name = ''
    let username = ''
    let plainPassword = ''
    let role = 'USER'

    for (const line of lines) {
      if (line.startsWith('Nombre:') && !line.startsWith('Nombre de usuario:')) {
        name = line.replace('Nombre:', '').trim()
      } else if (line.startsWith('Nombre de usuario:')) {
        username = line.replace('Nombre de usuario:', '').trim()
      } else if (line.startsWith('Contraseña:')) {
        plainPassword = line.replace('Contraseña:', '').trim()
      } else if (line.startsWith('Rol:')) {
        const r = line.replace('Rol:', '').trim()
        role = r.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER'
      }
    }

    if (name && username && plainPassword) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      await prisma.user.upsert({
        where: { username },
        update: {
          name,
          password: hashedPassword,
          role,
        },
        create: {
          name,
          username,
          password: hashedPassword,
          role,
        },
      })
      console.log(`Usuario procesado: ${username} (${role})`)
    }
  }

  console.log('✅ Base de datos poblada exitosamente con trabajadores.md')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
