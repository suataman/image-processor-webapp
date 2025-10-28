'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from './page.module.css'; // CSS modülünü import ettim

// Cropper bileşenini client tarafında dinamik olarak import edelim
const Cropper = dynamic(() => import('react-cropper').then((mod) => mod.default), {
  ssr: false, // Sunucu tarafında render etmeyi devre dışı bırakalım
});
import 'cropperjs/dist/cropper.css';
//import { Cropper } from 'react-cropper';


export default function ImageProcessor() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Form değerleri
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState('none');
  
  // Cropper için referans
  const cropperRef = useRef(null);
  const [cropData, setCropData] = useState(null);
  const [cropperReady, setCropperReady] = useState(false);
  
  // Önceden tanımlanmış boyutlar
  const predefinedSizes = [
    { name: 'Orijinal', width: 0, height: 0 },
    { name: 'Sosyal Medya (1080x1080)', width: 1080, height: 1080 },
    { name: 'Instagram Story (1080x1920)', width: 1080, height: 1920 },
    { name: 'Twitter Post (1200x675)', width: 1200, height: 675 },
    { name: 'Facebook Cover (820x312)', width: 820, height: 312 },
    { name: 'YouTube Thumbnail (1280x720)', width: 1280, height: 720 },
    { name: 'HD (1920x1080)', width: 1920, height: 1080 },
    { name: '4K (3840x2160)', width: 3840, height: 2160 },
  ];
  
  // Önceden tanımlanmış boyut seçimi
  const [selectedSize, setSelectedSize] = useState('custom');
  
  // Dosya seçildiğinde
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Önizleme URL'si oluştur
      const previewURL = URL.createObjectURL(selectedFile);
      setPreview(previewURL);
      setProcessedImage(null);
      setCropData(null);
      setSelectedSize('custom');
      setCropperReady(false); // Yeni resim yüklendiğinde cropper'ı sıfırla
    }
  };
  
  // Önceden tanımlanmış boyut seçildiğinde
  const handleSizeChange = (e) => {
    const sizeOption = e.target.value;
    setSelectedSize(sizeOption);
    
    if (sizeOption === 'custom') {
      // Özel boyut seçildiğinde mevcut değerleri koru
      return;
    }
    
    // Seçilen boyutu bul ve uygula
    const selectedPreset = predefinedSizes.find(size => size.name === sizeOption);
    if (selectedPreset) {
      setWidth(selectedPreset.width);
      setHeight(selectedPreset.height);
    }
  };
  
  // Cropper hazır olduğunda
  const handleCropperReady = () => {
    setCropperReady(true);
    console.log("Cropper hazır");
  };
  
  // Kırpma işlemi için
  const handleCrop = () => {
    if (cropperRef.current && cropperRef.current.cropper) {
      try {
        const cropperInstance = cropperRef.current.cropper;
        const cropData = cropperInstance.getData();
        
        // Kırpma bilgilerini kaydet
        setCropData({
          x: Math.round(cropData.x),
          y: Math.round(cropData.y),
          width: Math.round(cropData.width),
          height: Math.round(cropData.height)
        });
        
        console.log("Kırpma verileri:", {
          x: Math.round(cropData.x),
          y: Math.round(cropData.y),
          width: Math.round(cropData.width),
          height: Math.round(cropData.height)
        });
      } catch (err) {
        console.error("Kırpma hatası:", err);
      }
    } else {
      console.warn("Cropper referansı bulunamadı");
    }
  };
  
  // Form gönderildiğinde
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Lütfen bir resim seçin');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('width', width);
      formData.append('height', height);
      formData.append('rotation', rotation);
      formData.append('flip', flip);
      
      // Kırpma bilgileri varsa ekle
      if (cropData) {
        formData.append('cropTop', cropData.y);
        formData.append('cropLeft', cropData.x);
        formData.append('cropWidth', cropData.width);
        formData.append('cropHeight', cropData.height);
      } else {
        formData.append('cropTop', 0);
        formData.append('cropLeft', 0);
        formData.append('cropWidth', 0);
        formData.append('cropHeight', 0);
      }
      
      const response = await fetch('/api/process-image', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Resim işlenirken hata oluştu');
      }
      
      // İşlem başarılı, sonucu göster
      setProcessedImage(data.processedImage);
    } catch (err) {
      console.error('Hata:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Resim İşleme Uygulaması</h1>
      
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Ayarlar</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className="block mb-1">Resim Seçmek için aşağıdaki bara tıklayın</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border rounded p-2"
              />
            </div>
            
            <div className={styles.formGroup}>
              <h3>Boyutlandırma</h3>
              
              <div className={styles.inputRow}>
                <label>Hazır Formatlar</label>
                <select 
                  value={selectedSize}
                  onChange={handleSizeChange}
                  className={styles.inputRow}
                >
                  <option value="custom">Özel Boyut</option>
                  {predefinedSizes.map((size) => (
                    <option key={size.name} value={size.name}>
                      {size.name} {size.width > 0 ? `(${size.width}x${size.height})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <div className={styles.inputRow}>
                  <label>Genişlik (px)</label>
                  <input 
                    type="number" 
                    value={width}
                    onChange={(e) => {
                      setWidth(parseInt(e.target.value || 0));
                      setSelectedSize('custom');
                    }}
                    min="0"
                  />
                </div>
                <div className={styles.inputRow}>
                  <label>Yükseklik (px)</label>
                  <input 
                    type="number" 
                    value={height}
                    onChange={(e) => {
                      setHeight(parseInt(e.target.value || 0));
                      setSelectedSize('custom');
                    }}
                    min="0"
                  />
                </div>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Döndürme (derece)</label>
              <input 
                type="range" 
                min="-180" 
                max="180" 
                value={rotation}
                onChange={(e) => setRotation(parseInt(e.target.value))}
                className={styles.rangeInput}
              />
              <div className={styles.rangeValue}>{rotation}°</div>
            </div>
            
            <div className={styles.formGroup}>
              <div className={styles.inputRow}>
                <label>Çevirme</label>
                <select 
                  value={flip}
                  onChange={(e) => setFlip(e.target.value)}
                >
                  <option value="none">Yok</option>
                  <option value="horizontal">Yatay</option>
                  <option value="vertical">Dikey</option>
                  <option value="both">Her İki Yönde</option>
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <h3>Kırpma</h3>
              <p className={styles.note}>
                Görüntü üzerinde fare ile sürükleyerek kırpma alanı belirleyebilirsiniz.
              </p>
              
              {cropData && (
                <div>
                  <div className={styles.inputRow}>
                    <label>X: {cropData.x}</label>
                    <label>Y: {cropData.y}</label>
                  </div>
                  <div className={styles.inputRow}>
                    <label>Genişlik: {cropData.width}</label>
                    <label>Yükseklik: {cropData.height}</label>
                  </div>
                </div>
              )}
              
              {cropperReady && (
                    <button
                      type="button"
                      onClick={() => {
                        setCropData(null);
                        if (cropperRef.current && cropperRef.current.cropper) {
                          cropperRef.current.cropper.reset(); // This resets the cropper's visual state
                        }
                      }}
                      className={styles.button}
                    >
                      Kırpma Alanını Sıfırla
                    </button>
                  )}
            </div>
            
            <button
              type="submit"
              className={styles.button}
              disabled={loading || !file}
            >
              {loading ? 'İşleniyor...' : 'İşle'}
            </button>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                {error}
              </div>
            )}
          </form>
        </div>
        
        <div className={styles.card}>
          <h2>Önizleme</h2>
          <div className={styles.previewContainer}>
            {preview && !processedImage && (
              <div>
                <h3>Orijinal Görüntü / Kırpma</h3>
                <div className={styles.canvasContainer}>
                  {preview ? (
                    <Cropper
                      src={preview}
                      style={{ height: 400, width: '100%' }}
                      initialAspectRatio={16 / 9}
                      guides={true}
                      ref={cropperRef}
                      crop={handleCrop}
                      ready={handleCropperReady}
                      viewMode={1}
                      minCropBoxHeight={10}
                      minCropBoxWidth={10}
                      background={false}
                      responsive={true}
                      autoCropArea={1}
                      checkOrientation={false}
                      onInitialized={(instance) => {
                        console.log("Cropper başlatıldı");
                      }}
                    />
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <p>Resim yükleniyor...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {preview && processedImage && (
              <div>
                <h3>Orijinal Görüntü</h3>
                <div className={styles.canvasContainer}>
                  <Image 
                    src={preview} 
                    alt="Önizleme" 
                    fill 
                    style={{ objectFit: 'contain' }} 
                  />
                </div>
              </div>
            )}
            
            {processedImage && (
              <div className={styles.processedContainer}>
                <h3>İşlenmiş Görüntü</h3>
                <div className={styles.canvasContainer}>
                  <Image 
                    src={processedImage} 
                    alt="İşlenmiş görüntü" 
                    fill 
                    style={{ objectFit: 'contain' }}
                    className={styles.processed}
                  />
                </div>
                <div className="mt-2">
                  <a 
                    href={processedImage} 
                    download 
                    className={styles.downloadButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    İşlenmiş görüntüyü indir
                  </a>
                </div>
              </div>
            )}
            
            {!preview && !processedImage && (
              <div className={styles.canvasHelp}>
                Önizleme için lütfen bir resim yükleyin
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}