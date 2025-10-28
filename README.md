#  Image Processor Web App

Bu proje, **Python (OpenCV)** ve **Next.js** kullanılarak geliştirilmiş web tabanlı bir resim işleme uygulamasıdır.  
Kullanıcı, web arayüzü üzerinden bir resim yükleyerek aşağıdaki işlemleri gerçekleştirebilir:

-  Yeniden boyutlandırma  
-  Döndürme  
-  Yatay/Dikey çevirme  
-  Fare ile kırpma  
-  İşlenmiş resmi indirme  

---

##  Özellikler

- **Next.js 13+ frontend** (modern React arayüzü)  
-  **Python OpenCV backend** (görüntü işleme işlemleri)  
- **Kırpma aracı** (`react-cropper` kullanılmıştır)  
- **Görsel önizleme ve indirme desteği**  
- **Türkçe karakter uyumlu dosya işleme**  

---

## Kurulum Adımları

### Gerekli bağımlılıkları yükleyin

#### Frontend için:

```bash
npm install
```

#### Backend (Python) için:

```bash
pip install opencv-python numpy
```

### Sunucuyu Başlatın

```bash
npm run dev
```

## Resim İşleme Akışı

- Bir resim yükleyin

- İstediğiniz işlemleri seçin (boyut, döndürme, kırpma, çevirme)

- İşle butonuna tıklayın

- Python scripti (process_image.py) çalışır ve sonucu /public/uploads/ dizinine kaydeder

- İşlenmiş resmi tarayıcıda görüntüleyebilir veya indirebilirsiniz

## Kullanılan Teknolojiler
| Teknoloji                   | Açıklama                              |
| --------------------------- | ------------------------------------- |
| **Next.js 13+**             | Frontend framework                    |
| **React Cropper**           | Görüntü kırpma aracı                  |
| **OpenCV (Python)**         | Görüntü işleme motoru                 |
| **Node.js `child_process`** | Python scriptini tetikler             |
| **UUID**                    | Dosya adlarının benzersizleştirilmesi |

## Lisans
**Bu proje MIT Lisansı ile lisanslanmıştır.
Dilediğiniz gibi kullanabilir ve geliştirebilirsiniz.**

## Notlar
- Türkçe karakter içeren dizinlerde Python’ın dosya yolları hataya neden olabilir.
Bu nedenle scriptler geçici olarak C:/temp_uploads dizininde çalışmaktadır.

- Uygulama hem Windows hem Linux ortamında çalışabilir.

- process_image.py bağımsız olarak da terminalden test edilebilir:
```bash
python process_image.py input.jpg output.jpg 800 600 0 none 0 0 0 0
```

