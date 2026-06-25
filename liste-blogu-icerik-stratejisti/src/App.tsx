import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Check, 
  Copy, 
  RotateCw, 
  Trash2, 
  ExternalLink,
  Info,
  Sliders,
  FileText,
  MessageSquare,
  Bookmark,
  Image as ImageIcon
} from "lucide-react";
import { DEMO_STRATEGY, SAMPLE_TOPICS } from "./data";
import { ListicleStrategy, ListicleItem } from "./types";

export default function App() {
  const [topic, setTopic] = useState("");
  const [itemCount, setItemCount] = useState<number>(5);
  const [tone, setTone] = useState("samimi ve enerjik");
  const [audience, setAudience] = useState("Genel Okuyucu");
  const [customTone, setCustomTone] = useState("");
  const [customAudience, setCustomAudience] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Loaded strategy
  const [currentStrategy, setCurrentStrategy] = useState<ListicleStrategy>(DEMO_STRATEGY);
  const [selectedTitle, setSelectedTitle] = useState(DEMO_STRATEGY.titleSuggestions[0]);
  
  // History
  const [savedStrategies, setSavedStrategies] = useState<ListicleStrategy[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  
  // Editing state for visual search queries to fetch new images
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [customQueryText, setCustomQueryText] = useState("");

  // Load saved strategies from localStorage on mount
  useEffect(() => {
    const localData = localStorage.getItem("listcraft_strategies");
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedStrategies(parsed);
          // Set the first saved one as active
          setCurrentStrategy(parsed[0]);
          setSelectedTitle(parsed[0].selectedTitle || parsed[0].titleSuggestions[0]);
        } else {
          setSavedStrategies([DEMO_STRATEGY]);
        }
      } catch (e) {
        setSavedStrategies([DEMO_STRATEGY]);
      }
    } else {
      setSavedStrategies([DEMO_STRATEGY]);
    }
  }, []);

  // Save to localStorage when savedStrategies change
  const updateSavedStrategies = (newStrategies: ListicleStrategy[]) => {
    setSavedStrategies(newStrategies);
    localStorage.setItem("listcraft_strategies", JSON.stringify(newStrategies));
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTopic = topic.trim();
    if (!finalTopic) {
      setError("Lütfen bir liste konusu yazın veya önerilerden birini seçin.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const finalTone = tone === "custom" ? customTone : tone;
    const finalAudience = audience === "custom" ? customAudience : audience;

    try {
      const response = await fetch("/api/generate-listicle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: finalTopic,
          itemCount,
          tone: finalTone,
          audience: finalAudience,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "İçerik üretilirken sunucu hatası oluştu.");
      }

      const data = await response.json();
      
      // Post-process items to attach dynamic Unsplash images
      const itemsWithImages = data.items.map((item: any) => {
        const encodedQuery = encodeURIComponent(item.visualSearchQuery || "list article");
        return {
          ...item,
          imageUrl: `https://images.unsplash.com/featured/800x450/?${encodedQuery}&sig=${Math.floor(Math.random() * 100000)}`
        };
      });

      const newStrategy: ListicleStrategy = {
        id: "listicle-" + Date.now(),
        topic: finalTopic,
        tone: finalTone,
        audience: finalAudience,
        titleSuggestions: data.titleSuggestions || [finalTopic],
        selectedTitle: data.titleSuggestions?.[0] || finalTopic,
        items: itemsWithImages,
        closingQuestion: data.closingQuestion || "Sizce bu listedeki en önemli madde hangisi? Yorumlarda buluşalım!",
        createdAt: new Date().toISOString()
      };

      setCurrentStrategy(newStrategy);
      setSelectedTitle(newStrategy.titleSuggestions[0]);
      
      // Prepend to history
      const updatedHistory = [newStrategy, ...savedStrategies.filter(s => s.id !== "demo-listicle-id")];
      updateSavedStrategies(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectStrategy = (strat: ListicleStrategy) => {
    setCurrentStrategy(strat);
    setSelectedTitle(strat.selectedTitle || strat.titleSuggestions[0]);
  };

  const handleDeleteStrategy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedStrategies.filter(s => s.id !== id);
    updateSavedStrategies(updated);
    
    if (currentStrategy.id === id) {
      if (updated.length > 0) {
        setCurrentStrategy(updated[0]);
        setSelectedTitle(updated[0].selectedTitle || updated[0].titleSuggestions[0]);
      } else {
        setCurrentStrategy(DEMO_STRATEGY);
        setSelectedTitle(DEMO_STRATEGY.titleSuggestions[0]);
      }
    }
  };

  const handleTitleChange = (title: string) => {
    setSelectedTitle(title);
    const updated = savedStrategies.map(s => {
      if (s.id === currentStrategy.id) {
        return { ...s, selectedTitle: title };
      }
      return s;
    });
    updateSavedStrategies(updated);
    setCurrentStrategy(prev => ({ ...prev, selectedTitle: title }));
  };

  // Regenerate image for a specific item using custom visual query
  const handleRegenerateImage = (itemId: number, customQuery: string) => {
    const encoded = encodeURIComponent(customQuery || "object");
    const newUrl = `https://images.unsplash.com/featured/800x450/?${encoded}&sig=${Math.floor(Math.random() * 100000)}`;
    
    const updatedItems = currentStrategy.items.map(item => {
      if (item.id === itemId) {
        return { ...item, imageUrl: newUrl, visualSearchQuery: customQuery };
      }
      return item;
    });

    const updatedStrategy = { ...currentStrategy, items: updatedItems };
    setCurrentStrategy(updatedStrategy);
    
    const updatedHistory = savedStrategies.map(s => {
      if (s.id === currentStrategy.id) {
        return updatedStrategy;
      }
      return s;
    });
    updateSavedStrategies(updatedHistory);
    setEditingImageId(null);
  };

  // Copy Blogger-ready HTML template to clipboard
  const handleCopyHTML = () => {
    let htmlContent = `<!-- Blogger & WordPress için Hazır Liste Yazısı Taslağı -->\n`;
    htmlContent += `<h1 style="font-family: Arial, sans-serif; color: #2D2926; font-size: 28px; font-weight: bold; margin-bottom: 20px;">${selectedTitle}</h1>\n\n`;
    
    currentStrategy.items.forEach((item, index) => {
      htmlContent += `<!-- MADDE ${index + 1} BAŞLANGIÇ -->\n`;
      htmlContent += `<div style="margin-bottom: 40px; font-family: Arial, sans-serif; line-height: 1.6; color: #433E3A;">\n`;
      htmlContent += `  <h2 style="font-size: 22px; color: #2D2926; margin-top: 25px; margin-bottom: 15px; font-weight: bold;">${item.itemTitle}</h2>\n\n`;
      htmlContent += `  <!-- Görsel Alanı -->\n`;
      htmlContent += `  <div style="text-align: center; margin: 20px 0;">\n`;
      htmlContent += `    <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1'}" alt="${item.itemTitle}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" />\n`;
      htmlContent += `    <p style="font-size: 11px; color: #7A746E; margin-top: 5px; font-style: italic;">Görsel Arama Terimi: Unsplash - "${item.visualSearchQuery}"</p>\n`;
      htmlContent += `  </div>\n\n`;
      htmlContent += `  <p style="font-size: 16px; margin-bottom: 15px; color: #5C5651; font-style: italic;">${item.description}</p>\n\n`;
      htmlContent += `  <!-- Okuyucu Bağlama Kartı (Neden Yapmalısın?) -->\n`;
      htmlContent += `  <div style="background-color: #FDFBF9; border-left: 4px solid #8C7851; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">\n`;
      htmlContent += `    <strong style="color: #433E3A; display: block; margin-bottom: 5px; font-size: 14px;">💡 Neden Bunu Yapmalısın/İzlemelisin?</strong>\n`;
      htmlContent += `    <span style="font-size: 14px; color: #7A746E;">${item.whyPrompt}</span>\n`;
      htmlContent += `  </div>\n`;
      htmlContent += `</div>\n`;
      htmlContent += `<!-- MADDE ${index + 1} BİTİŞ -->\n\n`;
    });

    htmlContent += `<hr style="border: 0; border-top: 1px solid #E5E2DC; margin: 40px 0;" />\n\n`;
    htmlContent += `<div style="background-color: #2D2926; color: #FAF9F6; padding: 25px; border-radius: 8px; font-family: Arial, sans-serif; text-align: center;">\n`;
    htmlContent += `  <p style="font-size: 18px; font-style: italic; margin: 0 0 10px 0;">"${currentStrategy.closingQuestion}"</p>\n`;
    htmlContent += `  <p style="font-size: 12px; color: #9A948C; margin: 0;">Yorumlarınızı aşağıda paylaşmayı unutmayın!</p>\n`;
    htmlContent += `</div>`;

    navigator.clipboard.writeText(htmlContent);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 3000);
  };

  const handleCopyTextOnly = (item: ListicleItem, index: number) => {
    const text = `${item.itemTitle}\n\nAçıklama: ${item.description}\n\nNeden Yapmalısın: ${item.whyPrompt}\n\nGörsel Arama Kelimesi: ${item.visualSearchQuery}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div id="app-root" className="w-full min-h-screen flex flex-col bg-[#FAF9F6] text-[#433E3A] font-sans antialiased">
      {/* HEADER */}
      <header id="main-header" className="h-16 px-6 md:px-8 flex items-center justify-between border-b border-[#E5E2DC] bg-white sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-[#8C7851] rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-sm">
            L
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-[#433E3A] font-display flex items-center gap-1.5">
              ListCraft <span className="font-normal text-[#8C7851] text-sm bg-[#F4F1EE] px-2 py-0.5 rounded-full">Studio</span>
            </span>
            <span className="text-[10px] text-[#9A948C] font-mono tracking-wider uppercase">Liste İçerik Stratejisti</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-6 text-sm font-medium text-[#7A746E]">
            <a href="#editor-section" className="text-[#8C7851] font-semibold border-b-2 border-[#8C7851] pb-1">
              Strateji Sihirbazı
            </a>
            <a href="#preview-section" className="hover:text-[#8C7851] transition-colors pb-1">
              Canlı Önizleme
            </a>
            <a href="#tips-section" className="hover:text-[#8C7851] transition-colors pb-1">
              Blogger İpuçları
            </a>
          </div>

          <button 
            onClick={handleCopyHTML}
            disabled={!currentStrategy}
            className="flex items-center gap-2 px-4 py-2 bg-[#8C7851] text-white text-xs md:text-sm font-semibold rounded-full shadow-sm hover:bg-[#796743] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {copiedText ? (
              <>
                <Check className="w-4 h-4" />
                <span>Blogger HTML Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Blogger HTML Kopyala</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-[#F4F1EE] border-b border-[#E5E2DC] px-6 py-6 md:py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-[#DED9D1] rounded-full text-xs font-semibold text-[#8C7851] mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#8C7851]" />
              <span>Yapay Zeka Destekli Blog Stratejisti</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-bold font-display text-[#2D2926] tracking-tight leading-tight">
              Okuyucuları Sürükleyen <span className="italic text-[#8C7851]">Liste Blogları</span> Tasarlayın
            </h1>
            <p className="mt-2 text-sm md:text-base text-[#7A746E] leading-relaxed">
              Konunuzu belirleyin, hedef kitlenize uygun samimi, enerjik ve akıcı içerik planınızı anında çıkartın. Her madde için özel telif hakkı içermeyen görsel önerileriyle sitenizdeki kalma süresini katlayın.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-[#DED9D1] shadow-sm max-w-sm flex items-start gap-3">
            <div className="p-2 bg-[#FAF9F6] rounded-lg text-[#8C7851] shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#433E3A]">Blogger Başarı İpucu</h4>
              <p className="text-xs text-[#7A746E] mt-1 leading-relaxed italic">
                &ldquo;Liste bloglarında başarının anahtarı <strong>görselliktir</strong>. Yazı boyunca bir görsel, bir metin, bir görsel şeklinde gitmek okuyucuyu sayfada tutar.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROL PANEL & HISTORY (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* GENERATION BOX */}
          <div id="editor-section" className="bg-white rounded-2xl border border-[#E5E2DC] shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-[#FAF9F6] pb-3">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-[#8C7851]" />
                <h2 className="font-bold text-base md:text-lg text-[#2D2926] font-display">Strateji Sihirbazı</h2>
              </div>
              <span className="text-[10px] font-bold text-[#8C7851] bg-[#FAF9F6] border border-[#E5E2DC] px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini 3.5
              </span>
            </div>

            <form onSubmit={handleGenerate} className="space-y-5">
              
              {/* TOPIC INPUT */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9A948C] mb-2 flex items-center justify-between">
                  <span>İçerik Konusu *</span>
                  <span className="text-[10px] text-[#7A746E] lowercase font-normal">örneğin filmler, alışkanlıklar, gezi</span>
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Örn: Mutlaka İzlenmesi Gereken 5 Bilim Kurgu Filmi veya Evde Yapabileceğiniz 5 Kolay Egzersiz..."
                    className="w-full bg-[#FAF9F6] border border-[#DED9D1] rounded-xl px-4 py-3 text-sm font-medium text-[#433E3A] placeholder-[#9A948C] focus:outline-none focus:border-[#8C7851] focus:ring-1 focus:ring-[#8C7851] transition-all resize-none"
                    required
                  />
                </div>
              </div>

              {/* QUICK TOPIC SUGGESTIONS */}
              <div>
                <span className="block text-[11px] font-semibold text-[#9A948C] mb-2">Hızlı İlham Alın (Önerilen Konular):</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_TOPICS.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTopic(t)}
                      className="text-[11px] text-left px-2.5 py-1.5 bg-[#FAF9F6] hover:bg-[#F4F1EE] border border-[#E5E2DC] rounded-lg text-[#5C5651] transition-all max-w-full truncate"
                      title={t}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ITEM COUNT SELECTOR */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9A948C] mb-2">
                  Madde Sayısı
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setItemCount(5)}
                    className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                      itemCount === 5
                        ? "bg-[#8C7851] border-[#8C7851] text-white shadow-sm"
                        : "bg-white border-[#DED9D1] text-[#7A746E] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    5 Maddelik Liste
                  </button>
                  <button
                    type="button"
                    onClick={() => setItemCount(10)}
                    className={`py-2 px-4 rounded-xl border text-xs font-bold transition-all ${
                      itemCount === 10
                        ? "bg-[#8C7851] border-[#8C7851] text-white shadow-sm"
                        : "bg-white border-[#DED9D1] text-[#7A746E] hover:bg-[#FAF9F6]"
                    }`}
                  >
                    10 Maddelik Liste
                  </button>
                </div>
              </div>

              {/* TONE OF VOICE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9A948C] mb-2">
                  Yazım Tonu (Dili)
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#DED9D1] rounded-xl px-4 py-2.5 text-sm text-[#433E3A] focus:outline-none focus:border-[#8C7851]"
                >
                  <option value="samimi, enerjik ve akıcı">Samimi, Enerjik ve Akıcı (Önerilen)</option>
                  <option value="gizemli, merak uyandırıcı ve heyecanlı">Gizemli ve Merak Uyandırıcı</option>
                  <option value="eğlenceli, esprili ve dinamik">Eğlenceli ve Esprili</option>
                  <option value="profesyonel, bilgilendirici ve sade">Profesyonel ve Bilgilendirici</option>
                  <option value="custom">Özel Bir Dil Tonu Yaz...</option>
                </select>

                {tone === "custom" && (
                  <input
                    type="text"
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value)}
                    placeholder="Örn: Nostaljik ve şiirsel, hafif alaycı..."
                    className="w-full bg-[#FAF9F6] border border-[#DED9D1] rounded-xl px-4 py-2 text-sm mt-2 focus:outline-none focus:border-[#8C7851]"
                    required
                  />
                )}
              </div>

              {/* TARGET AUDIENCE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#9A948C] mb-2">
                  Hedef Kitle
                </label>
                <select
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#DED9D1] rounded-xl px-4 py-2.5 text-sm text-[#433E3A] focus:outline-none focus:border-[#8C7851]"
                >
                  <option value="Genel Okuyucu">Genel İnternet Okuyucusu</option>
                  <option value="Gençler ve Sosyal Medya Kullanıcıları">Gençler & Sosyal Medya Meraklıları</option>
                  <option value="Teknoloji ve Girişimcilik Meraklıları">Yazılımcı ve Teknoloji Severler</option>
                  <option value="Ev Hanımları ve Ebeveynler">Ebeveynler & Ev Odaklı Kitle</option>
                  <option value="custom">Özel Bir Hedef Kitle Belirt...</option>
                </select>

                {audience === "custom" && (
                  <input
                    type="text"
                    value={customAudience}
                    onChange={(e) => setCustomAudience(e.target.value)}
                    placeholder="Örn: 20-30 yaş arası seyahat tutkunları..."
                    className="w-full bg-[#FAF9F6] border border-[#DED9D1] rounded-xl px-4 py-2 text-sm mt-2 focus:outline-none focus:border-[#8C7851]"
                    required
                  />
                )}
              </div>

              {/* ERROR STATE */}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg text-xs text-red-700">
                  <p className="font-bold">Hata oluştu</p>
                  <p>{error}</p>
                </div>
              )}

              {/* GENERATE BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-[#8C7851] text-white font-bold rounded-xl shadow-md hover:bg-[#796743] active:scale-[0.98] transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-75 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>Yapay Zeka Hazırlıyor...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Liste İçeriği Oluştur</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* HISTORIC SAVED STRATEGIES */}
          <div className="bg-white rounded-2xl border border-[#E5E2DC] shadow-sm p-5">
            <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-[#FAF9F6]">
              <Bookmark className="w-4 h-4 text-[#8C7851]" />
              <h3 className="font-bold text-sm text-[#2D2926] font-display">Geçmiş Taslaklarım</h3>
              <span className="text-[10px] font-mono bg-[#F4F1EE] text-[#7A746E] px-2 py-0.5 rounded-full ml-auto">
                {savedStrategies.length} kayıt
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {savedStrategies.map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => handleSelectStrategy(strat)}
                  className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between group ${
                    currentStrategy.id === strat.id
                      ? "bg-[#FDFBF9] border-[#8C7851] shadow-xs"
                      : "bg-[#FAF9F6] border-[#E5E2DC] hover:bg-[#F4F1EE]"
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-bold text-[#433E3A] truncate">
                      {strat.selectedTitle || strat.topic}
                    </p>
                    <div className="flex items-center space-x-2 mt-1 text-[10px] text-[#9A948C]">
                      <span className="capitalize">{strat.items.length} Maddelik</span>
                      <span>•</span>
                      <span>{new Date(strat.createdAt).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteStrategy(strat.id, e)}
                    className="p-1 rounded-md text-[#9A948C] hover:text-red-600 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    title="Taslağı Sil"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* DYNAMIC METADATA & TIPS BANNER */}
          <div className="bg-[#8C7851] text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
              <BookOpen className="w-40 h-40" />
            </div>
            <h4 className="font-bold text-sm font-display mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-white/90" />
              Görsel Dağılım Altın Kuralı
            </h4>
            <p className="text-xs text-[#FAF9F6]/90 leading-relaxed">
              Google sıralamalarında ve Blogger&apos;da zirveye çıkmak için her listenin ilk girişinde, aralarında ve finalinde görsel kullanmalısınız. Hazırladığımız bu strateji taslağı size tam olarak bu ritmi kazandırır.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: INTERACTIVE PREVIEW & HTML GENERATION (col-span-8) */}
        <div id="preview-section" className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* TITLE CHANGER BLOCK */}
          <div className="bg-white rounded-2xl border border-[#E5E2DC] shadow-sm p-5 md:p-6">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C7851] block mb-2">
              Adım 1: Merak Uyandırıcı Başlık Seçimi
            </span>
            <h3 className="font-bold text-sm text-[#2D2926] font-display mb-3">
              Yapay zeka tıklama oranı (CTR) en yüksek şu başlıkları önerdi. Kullanmak istediğinize tıklayın:
            </h3>

            <div className="space-y-2.5">
              {currentStrategy.titleSuggestions.map((titleOption, idx) => {
                const isSelected = selectedTitle === titleOption;
                return (
                  <button
                    key={idx}
                    onClick={() => handleTitleChange(titleOption)}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-start gap-3 ${
                      isSelected
                        ? "bg-[#FDFBF9] border-[#8C7851] ring-1 ring-[#8C7851]"
                        : "bg-[#FAF9F6] border-[#E5E2DC] hover:bg-[#F4F1EE]"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected ? "bg-[#8C7851] text-white" : "bg-[#E5E2DC] text-[#7A746E]"
                    }`}>
                      {idx + 1}
                    </span>
                    <span className={`flex-1 font-semibold leading-snug ${isSelected ? "text-[#2D2926]" : "text-[#5C5651]"}`}>
                      {titleOption}
                    </span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-[#8C7851] shrink-0 self-center" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN BLOG PREVIEW DEVICE */}
          <div className="flex flex-col">
            
            {/* BROWSER DEVICE TOPBAR */}
            <div className="w-full bg-[#E5E2DC] rounded-t-2xl h-11 flex items-center px-4 justify-between">
              <div className="flex space-x-1.5 items-center">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="bg-white/75 text-[10px] text-[#7A746E] px-8 py-1 rounded-md max-w-sm truncate font-mono">
                blogger.com/post/preview/listcraft
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#7A746E] hidden sm:inline">
                Canlı Önizleme
              </span>
            </div>

            {/* LIVE POST WORKSPACE */}
            <div className="bg-white border-x border-b border-[#E5E2DC] rounded-b-2xl shadow-xl overflow-hidden">
              
              {/* TOP HERO */}
              <div className="p-6 md:p-10 border-b border-[#F4F1EE] bg-[#FAF9F6]">
                <div className="max-w-2xl mx-auto text-center">
                  <span className="text-[#8C7851] text-xs font-bold uppercase tracking-[0.25em] block mb-3">
                    LİSTE BLOGU İÇERİK STRATEJİSİ
                  </span>
                  <h1 className="text-2xl md:text-4xl font-bold text-[#2D2926] leading-tight font-display mb-4 italic">
                    {selectedTitle}
                  </h1>
                  
                  <div className="flex items-center justify-center space-x-4 text-xs text-[#7A746E] font-mono">
                    <span className="bg-[#E5E2DC] text-[#433E3A] px-2.5 py-1 rounded-md">
                      Ton: {currentStrategy.tone}
                    </span>
                    <span className="bg-[#E5E2DC] text-[#433E3A] px-2.5 py-1 rounded-md">
                      Kitle: {currentStrategy.audience}
                    </span>
                  </div>
                </div>
              </div>

              {/* LIST ITEMS RENDERER */}
              <div className="p-5 md:p-10 max-w-3xl mx-auto space-y-12">
                
                {currentStrategy.items.map((item, index) => {
                  return (
                    <div key={item.id} className="relative group border-b border-[#FAF1EE] pb-10 last:border-0 last:pb-0">
                      
                      {/* OPTIONAL ITEM INDEX FLIPPER */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl md:text-3xl font-bold text-[#8C7851] opacity-40 font-mono">
                          #{String(index + 1).padStart(2, '0')}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyTextOnly(item, index)}
                            className="text-xs text-[#7A746E] hover:text-[#8C7851] bg-[#FAF9F6] border border-[#E5E2DC] px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                            title="Maddenin ham metnini kopyala"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-green-600" />
                                <span className="text-green-600 font-medium">Kopyalandı!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Metni Kopyala</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* ITEM TITLE */}
                      <h2 className="text-xl md:text-2xl font-bold text-[#2D2926] mb-4 font-display">
                        {item.itemTitle}
                      </h2>

                      {/* BLOGGER FLOW: IMAGE -> TEXT -> REASON */}
                      
                      {/* DYNAMIC IMAGE RENDERER */}
                      <div className="my-5 relative rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#E5E2DC] shadow-sm group/image aspect-[16/9]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.itemTitle}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
                            onError={(e) => {
                              // Fallback placeholder
                              (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <ImageIcon className="w-10 h-10 text-[#8C7851] opacity-50 mb-2" />
                            <span className="text-xs font-semibold text-[#7A746E]">Görsel Yükleniyor...</span>
                          </div>
                        )}

                        {/* HOVER OVERLAY TO ADJUST IMAGE ARGS */}
                        <div className="absolute inset-0 bg-[#433E3A]/70 flex flex-col items-center justify-center p-4 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300">
                          <div className="text-center text-white max-w-sm">
                            <span className="text-[10px] uppercase tracking-wider text-[#9A948C] font-mono block mb-1">
                              Önerilen İngilizce Görsel Arama Terimi
                            </span>
                            <p className="text-sm font-semibold italic text-[#FAF9F6] mb-4">
                              &ldquo;{item.visualSearchQuery}&rdquo;
                            </p>

                            {editingImageId === item.id ? (
                              <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                                <input
                                  type="text"
                                  value={customQueryText}
                                  onChange={(e) => setCustomQueryText(e.target.value)}
                                  placeholder="Yeni İngilizce arama terimi..."
                                  className="w-full bg-white text-gray-800 text-xs px-2.5 py-1.5 rounded focus:outline-none"
                                />
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleRegenerateImage(item.id, customQueryText)}
                                    className="bg-[#8C7851] hover:bg-[#796743] text-white text-[11px] font-bold px-3 py-1 rounded"
                                  >
                                    Uygula
                                  </button>
                                  <button
                                    onClick={() => setEditingImageId(null)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white text-[11px] font-bold px-3 py-1 rounded"
                                  >
                                    Vazgeç
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-center">
                                <button
                                  onClick={() => {
                                    setEditingImageId(item.id);
                                    setCustomQueryText(item.visualSearchQuery);
                                  }}
                                  className="px-3 py-1.5 bg-[#8C7851] text-white rounded text-xs font-bold hover:bg-[#796743] transition-all flex items-center gap-1"
                                >
                                  <RotateCw className="w-3 h-3 animate-pulse" />
                                  Görseli Değiştir
                                </button>
                                <a
                                  href={`https://unsplash.com/s/photos/${encodeURIComponent(item.visualSearchQuery)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-white/25 hover:bg-white/40 text-white rounded text-xs font-bold transition-all flex items-center gap-1"
                                >
                                  <span>Unsplash&apos;ta Aç</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* BOTTOM INFO CHIP */}
                        <div className="absolute left-3 bottom-3 bg-white/95 px-3 py-1.5 rounded-lg shadow-xs text-[10px] text-[#433E3A] font-semibold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span>Adil Kullanım Görseli</span>
                        </div>
                      </div>

                      {/* IMMERSIVE DESCRIPTION (2-3 sentences) */}
                      <p className="text-[#5C5651] leading-relaxed text-sm md:text-base font-serif italic mb-5">
                        {item.description}
                      </p>

                      {/* RETENTION CARD */}
                      <div className="bg-[#FDFBF9] border-l-4 border-[#8C7851] p-5 rounded-r-xl shadow-xs">
                        <span className="block font-bold text-xs uppercase tracking-wider text-[#433E3A] mb-1.5">
                          💡 Neden İzlemeli / Yapmalısın?
                        </span>
                        <p className="text-xs md:text-sm text-[#7A746E] leading-relaxed">
                          {item.whyPrompt}
                        </p>
                      </div>

                    </div>
                  );
                })}

              </div>

              {/* FOOTER: ENGAGEMENT CLOSING QUESTION */}
              <footer className="p-6 md:p-8 bg-[#2D2926] text-[#FAF9F6] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 max-w-xl text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-1.5">
                    <MessageSquare className="w-4 h-4 text-[#8C7851]" />
                    <span className="text-[10px] uppercase tracking-widest text-[#9A948C] font-bold">
                      Yorum Teşvik Edici Kapanış Sorusu
                    </span>
                  </div>
                  <p className="text-sm md:text-base font-medium font-serif italic">
                    &ldquo;{currentStrategy.closingQuestion}&rdquo;
                  </p>
                </div>
                <div className="shrink-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#8C7851] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                    💬
                  </div>
                </div>
              </footer>

            </div>
          </div>

          {/* DYNAMIC HTML BLOCK FOR EASY PASTE TO BLOGGER */}
          <div id="tips-section" className="bg-white rounded-2xl border border-[#E5E2DC] shadow-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <FileText className="w-4.5 h-4.5 text-[#8C7851]" />
                <h3 className="font-bold text-base text-[#2D2926] font-display">Blogger / WordPress Hazır Kod Taslağı</h3>
              </div>
              
              <button
                onClick={handleCopyHTML}
                className="text-xs text-[#8C7851] hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Tüm Kodları Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#7A746E] leading-relaxed mb-4">
              Aşağıdaki kodları kopyalayıp Blogger yazı panelindeki <strong>HTML Görünümü</strong> sekmesine doğrudan yapıştırarak sitenizi hemen yayına hazırlayabilirsiniz.
            </p>

            <div className="bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl p-4 font-mono text-[11px] text-[#433E3A] max-h-56 overflow-y-auto whitespace-pre-wrap leading-relaxed select-all">
{`<!-- Blogger & WordPress için Hazır Liste Yazısı Taslağı -->
<h1 style="font-family: Arial, sans-serif; color: #2D2926; font-size: 28px; font-weight: bold; margin-bottom: 20px;">${selectedTitle}</h1>

${currentStrategy.items.map((item, index) => `<!-- MADDE ${index + 1} BAŞLANGIÇ -->
<div style="margin-bottom: 40px; font-family: Arial, sans-serif; line-height: 1.6; color: #433E3A;">
  <h2 style="font-size: 22px; color: #2D2926; margin-top: 25px; margin-bottom: 15px; font-weight: bold;">${item.itemTitle}</h2>
  
  <div style="text-align: center; margin: 20px 0;">
    <img src="${item.imageUrl || ''}" alt="${item.itemTitle}" style="max-width: 100%; height: auto; border-radius: 8px;" />
  </div>

  <p style="font-size: 16px; margin-bottom: 15px; color: #5C5651; font-style: italic;">${item.description}</p>

  <div style="background-color: #FDFBF9; border-left: 4px solid #8C7851; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
    <strong style="color: #433E3A; display: block; margin-bottom: 5px; font-size: 14px;">💡 Neden Bunu Yapmalısın/İzlemelisin?</strong>
    <span style="font-size: 14px; color: #7A746E;">${item.whyPrompt}</span>
  </div>
</div>`).join("\n\n")}

<hr style="border: 0; border-top: 1px solid #E5E2DC; margin: 40px 0;" />

<div style="background-color: #2D2926; color: #FAF9F6; padding: 25px; border-radius: 8px; font-family: Arial, sans-serif; text-align: center;">
  <p style="font-size: 18px; font-style: italic; margin: 0 0 10px 0;">"${currentStrategy.closingQuestion}"</p>
  <p style="font-size: 12px; color: #9A948C; margin: 0;">Yorumlarınızı aşağıda paylaşmayı unutmayın!</p>
</div>`}
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#E5E2DC] py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#7A746E]">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm text-[#433E3A] font-display">ListCraft Studio</span>
            <span>|</span>
            <span>&copy; {new Date().getFullYear()} İçerik Stratejisti</span>
          </div>
          <div className="flex space-x-6">
            <span>Özgün ve Sürükleyici Liste Yapıları</span>
            <span>•</span>
            <span>Blogger Uyumlu</span>
            <span>•</span>
            <span>Görsel Odaklı SEO Planı</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
