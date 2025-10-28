# scripts/process_image.py
import sys
import cv2
import numpy as np
import os

def process_image(
    input_path, 
    output_path, 
    width, 
    height, 
    rotation, 
    flip, 
    crop_top, 
    crop_left, 
    crop_width, 
    crop_height
):
    try:
        # Resmi oku
        img = cv2.imread(input_path)
        
        if img is None:
            print(f"Hata: Resim okunamadı - {input_path}")
            return False
        
        # Orijinal resmin boyutlarını sakla
        original_height, original_width = img.shape[:2]
        print(f"Orijinal resim boyutu: {original_width}x{original_height}")
        
        # Kırpma işlemi (eğer kırpma parametreleri belirtilmişse)
        if crop_width > 0 and crop_height > 0:
            # Kırpma sınırlarının resim boyutunu aşmadığından emin olalım
            crop_left = max(0, min(crop_left, original_width - 1))
            crop_top = max(0, min(crop_top, original_height - 1))
            crop_right = min(crop_left + crop_width, original_width)
            crop_bottom = min(crop_top + crop_height, original_height)
            
            print(f"Kırpma alanı: ({crop_left}, {crop_top}, {crop_right}, {crop_bottom})")
            
            if crop_left < original_width and crop_top < original_height:
                img = img[crop_top:crop_bottom, crop_left:crop_right]
                print(f"Kırpılmış resim boyutu: {crop_right-crop_left}x{crop_bottom-crop_top}")
        
        # Döndürme işlemi
        if rotation != 0:
            # Resmin merkezini bul
            height, width = img.shape[:2]
            center = (width / 2, height / 2)
            
            # Döndürme matrisini oluştur
            rotation_matrix = cv2.getRotationMatrix2D(center, rotation, 1.0)
            
            # Döndürme işlemini uygula (sınırları genişleterek)
            abs_cos = abs(rotation_matrix[0, 0])
            abs_sin = abs(rotation_matrix[0, 1])
            
            # Yeni genişlik ve yükseklik hesapla
            new_width = int(height * abs_sin + width * abs_cos)
            new_height = int(height * abs_cos + width * abs_sin)
            
            # Döndürme matrisini güncelle
            rotation_matrix[0, 2] += new_width / 2 - center[0]
            rotation_matrix[1, 2] += new_height / 2 - center[1]
            
            # Resmi döndür
            img = cv2.warpAffine(img, rotation_matrix, (new_width, new_height), flags=cv2.INTER_LINEAR)
            print(f"Döndürülmüş resim boyutu: {new_width}x{new_height}")
        
        # Çevirme işlemi
        if flip == 'horizontal':
            img = cv2.flip(img, 1)  # 1 = yatay çevirme
            print("Resim yatay çevrildi")
        elif flip == 'vertical':
            img = cv2.flip(img, 0)  # 0 = dikey çevirme
            print("Resim dikey çevrildi")
        elif flip == 'both':
            img = cv2.flip(img, -1)  # -1 = hem yatay hem dikey çevirme
            print("Resim her iki yönde çevrildi")
        
        # Yeniden boyutlandırma işlemi
        if width > 0 and height > 0:
            # Yeniden boyutlandır
            img = cv2.resize(img, (int(width), int(height)), interpolation=cv2.INTER_AREA)
            print(f"Yeniden boyutlandırılmış resim: {width}x{height}")
        elif width > 0:
            # Yüksekliğe göre genişliği orantılı hesapla
            current_height, current_width = img.shape[:2]
            aspect_ratio = current_height / current_width
            new_height = int(int(width) * aspect_ratio)
            img = cv2.resize(img, (int(width), new_height), interpolation=cv2.INTER_AREA)
            print(f"Yeniden boyutlandırılmış resim: {width}x{new_height}")
        elif height > 0:
            # Genişliğe göre yüksekliği orantılı hesapla
            current_height, current_width = img.shape[:2]
            aspect_ratio = current_width / current_height
            new_width = int(int(height) * aspect_ratio)
            img = cv2.resize(img, (new_width, int(height)), interpolation=cv2.INTER_AREA)
            print(f"Yeniden boyutlandırılmış resim: {new_width}x{height}")
        
        # Klasör yoksa oluştur
        output_dir = os.path.dirname(output_path)
        if output_dir and not os.path.exists(output_dir):
            os.makedirs(output_dir)
        
        # İşlenmiş resmi kaydet
        cv2.imwrite(output_path, img)
        print(f"Resim başarıyla işlendi ve {output_path} konumuna kaydedildi.")
        return True
    
    except Exception as e:
        print(f"Hata: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 11:
        print("Kullanım: python process_image.py <girdi_dosyası> <çıktı_dosyası> <genişlik> <yükseklik> <döndürme> <çevirme> <kırpma_üst> <kırpma_sol> <kırpma_genişlik> <kırpma_yükseklik>")
        sys.exit(1)
    
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    width = int(sys.argv[3])
    height = int(sys.argv[4])
    rotation = int(sys.argv[5])
    flip = sys.argv[6]
    crop_top = int(sys.argv[7])
    crop_left = int(sys.argv[8])
    crop_width = int(sys.argv[9])
    crop_height = int(sys.argv[10])
    
    success = process_image(
        input_path, 
        output_path, 
        width, 
        height, 
        rotation, 
        flip, 
        crop_top, 
        crop_left, 
        crop_width, 
        crop_height
    )
    
    sys.exit(0 if success else 1)