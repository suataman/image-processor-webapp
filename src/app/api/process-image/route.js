import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
  try {
    // FormData'yı parse et
    const formData = await req.formData();
    const file = formData.get('image');
    
    if (!file) {
      return NextResponse.json({ error: 'Resim yüklenemedi' }, { status: 400 });
    }
    
    // Dosya adını Türkçe karakter ve boşluk içermeyecek şekilde ayarla
    const fileExtension = file.name.split('.').pop();
    const safeFileName = `${uuidv4()}.${fileExtension}`;
    
    // Proje kök dizini - türkçe karakter içeriyor mu kontrol et
    const projectRoot = process.cwd();
    console.log("Project root:", projectRoot);
    
    // Yeni bir uploads dizini oluştur - C: sürücüsünün kökünde (veya başka bir güvenli yerde)
    // Bu yaklaşım, yolda Türkçe karakter olması sorununu tamamen ortadan kaldırır
    const tempUploadDir = "C:/temp_uploads";
    const inputPath = path.join(tempUploadDir, safeFileName);
    const outputPath = path.join(tempUploadDir, `processed_${safeFileName}`);
    
    // Upload dizini yoksa oluştur
    if (!fs.existsSync(tempUploadDir)) {
      fs.mkdirSync(tempUploadDir, { recursive: true });
    }
    
    // Dosyayı kaydet
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(inputPath, buffer);
    
    // Form parametrelerini al ve varsayılan değerleri sağla
    const width = parseInt(formData.get('width') || '0');
    const height = parseInt(formData.get('height') || '0');
    const rotation = parseFloat(formData.get('rotation') || '0');
    const flip = formData.get('flip') || 'none';
    const cropTop = parseInt(formData.get('cropTop') || '0');
    const cropLeft = parseInt(formData.get('cropLeft') || '0');
    const cropWidth = parseInt(formData.get('cropWidth') || '0');
    const cropHeight = parseInt(formData.get('cropHeight') || '0');
    
    // Python scriptini güvenli bir yere kopyalayalım
    const originalPythonScript = path.join(projectRoot, 'public', 'script', 'process_image.py');
    const safePythonScriptPath = path.join(tempUploadDir, 'process_image.py');
    
    // Python scriptini güvenli yere kopyala
    fs.copyFileSync(originalPythonScript, safePythonScriptPath);
    
    console.log("Safe Python script path:", safePythonScriptPath);
    console.log("Safe Input path:", inputPath);
    console.log("Safe Output path:", outputPath);
    
    // Python scriptini çalıştır - TÜM gerekli parametreleri gönder
    const pythonProcess = spawn('python', [
      safePythonScriptPath,      // Türkçe karakter içermeyen güvenli yol
      inputPath,                 // input_path - Türkçe karakter içermeyen güvenli yol
      outputPath,                // output_path - Türkçe karakter içermeyen güvenli yol 
      width.toString(),          // width
      height.toString(),         // height
      rotation.toString(),       // rotation
      flip,                      // flip
      cropTop.toString(),        // crop_top
      cropLeft.toString(),       // crop_left
      cropWidth.toString(),      // crop_width
      cropHeight.toString()      // crop_height
    ]);
    
    // Python'dan gelen çıktıyı topla
    let result = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
      console.log("Python output:", data.toString());
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      console.error("Python error:", data.toString());
    });
    
    // İşlem tamamlandığında yanıt döndür
    return new Promise((resolve) => {
      pythonProcess.on('close', (code) => {
        console.log(`Python process exited with code ${code}`);
        
        if (code !== 0) {
          console.error('Python process error:', errorOutput);
          resolve(NextResponse.json({ 
            success: false, 
            error: 'İşlem sırasında hata oluştu', 
            details: errorOutput
          }, { status: 500 }));
        } else {
          // İşlenmiş resmi public/uploads dizinine kopyala (frontend erişimi için)
          const publicUploadsDir = path.join(projectRoot, 'public', 'uploads');
          if (!fs.existsSync(publicUploadsDir)) {
            fs.mkdirSync(publicUploadsDir, { recursive: true });
          }
          
          const publicOriginalPath = path.join(publicUploadsDir, safeFileName);
          const publicProcessedPath = path.join(publicUploadsDir, `processed_${safeFileName}`);
          
          // Kopyalama işlemi
          fs.copyFileSync(inputPath, publicOriginalPath);
          fs.copyFileSync(outputPath, publicProcessedPath);
          
          resolve(NextResponse.json({ 
            success: true, 
            message: 'Resim başarıyla işlendi',
            result: result,
            originalImage: `/uploads/${safeFileName}`,
            processedImage: `/uploads/processed_${safeFileName}`
          }));
        }
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 