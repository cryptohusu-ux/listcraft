import { ListicleStrategy, UnsplashPreset } from "./types";

export const STABLE_IMAGES = {
  cinema: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80",
  scifi: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80",
  space: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
  books: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80",
  tech: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop&q=80",
  travel: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",
  food: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
  fitness: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
  finance: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800&auto=format&fit=crop&q=80",
  music: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80",
  workspace: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
  art: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop&q=80",
};

export const UNSPLASH_PRESETS: UnsplashPreset[] = [
  { id: "cinema", keyword: "Cinema / Movies", description: "Sinema Salonu & Film", url: STABLE_IMAGES.cinema },
  { id: "scifi", keyword: "Sci-Fi", description: "Bilim Kurgu & Uzay", url: STABLE_IMAGES.scifi },
  { id: "space", keyword: "Outer Space", description: "Derin Uzay & Kozmos", url: STABLE_IMAGES.space },
  { id: "books", keyword: "Books", description: "Kitaplar & Kütüphane", url: STABLE_IMAGES.books },
  { id: "tech", keyword: "Technology", description: "Teknoloji & Kodlama", url: STABLE_IMAGES.tech },
  { id: "travel", keyword: "Travel", description: "Seyahat & Macera", url: STABLE_IMAGES.travel },
  { id: "food", keyword: "Healthy Food", description: "Sağlıklı Yemek & Mutfak", url: STABLE_IMAGES.food },
  { id: "fitness", keyword: "Fitness", description: "Spor & Egzersiz", url: STABLE_IMAGES.fitness },
  { id: "finance", keyword: "Finance", description: "Yatırım & Para", url: STABLE_IMAGES.finance },
  { id: "music", keyword: "Music", description: "Müzik & Sanat", url: STABLE_IMAGES.music },
  { id: "workspace", keyword: "Workspace", description: "Çalışma Alanı & Focus", url: STABLE_IMAGES.workspace },
  { id: "art", keyword: "Art", description: "Resim & Yaratıcılık", url: STABLE_IMAGES.art },
];

export const DEMO_STRATEGY: ListicleStrategy = {
  id: "demo-listicle-id",
  topic: "Mutlaka İzlenmesi Gereken 5 Bilim Kurgu Filmi",
  tone: "samimi ve enerjik",
  audience: "Sinefiller ve genel sinema izleyicisi",
  titleSuggestions: [
    "Ufkunuzu Katlayacak: Mutlaka İzlenmesi Gereken 5 Bilim Kurgu Filmi",
    "Gözlerinizi Ekrandan Ayıramayacaksınız! En İyi 5 Bilim Kurgu Başyapıtı",
    "Gerçekliğin Sınırlarını Zorlayan 5 Muhteşem Bilim Kurgu Başyapıtı",
  ],
  selectedTitle: "Ufkunuzu Katlayacak: Mutlaka İzlenmesi Gereken 5 Bilim Kurgu Filmi",
  items: [
    {
      id: 1,
      itemTitle: "1. Interstellar (Yıldızlararası)",
      description: "Christopher Nolan'ın bu başyapıtı, insanlığın yok olma tehlikesiyle karşı karşıya olduğu bir gelecekte yeni bir gezegen arayışını konu alıyor. Solucan delikleri, kara delikler ve görelilik teorisini muhteşem bir görsel dille harmanlayan yapım, aynı zamanda baba-kız ilişkisini merkezine alarak duygusal derinliğiyle de izleyiciyi sarsıyor.",
      whyPrompt: "Zaman bükülmelerini, uzay fiziğini ve insan ruhunun sınırlarını Nolan'ın kusursuz sinematografisiyle deneyimlemek için kesinlikle listenin başında yer almalı!",
      visualSearchQuery: "Interstellar space black hole",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      itemTitle: "2. Blade Runner 2049",
      description: "Denis Villeneuve, Ridley Scott'ın kült klasiğini devralarak görsel olarak adeta bir şiir niteliğinde devam filmi sunuyor. Distopik bir gelecekte, insan benzeri replikantları avlamakla görevli bir memurun, toplumsal düzeni tamamen altüst edecek derin bir sırrı keşfetmesini izliyoruz. Her bir karesi tablo güzelliğinde olan film, varoluşsal soruları masaya yatırıyor.",
      whyPrompt: "Sarı ve neon mavi tonların kusursuz dansını izlemek, Roger Deakins'in Oscar ödüllü görüntü yönetmenliği eşliğinde felsefi bir yolculuğa çıkmak için kaçırılmamalı!",
      visualSearchQuery: "cyberpunk city neon yellow blue",
      imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      itemTitle: "3. Arrival (Geliş)",
      description: "Dünyanın farklı bölgelerine gizemli uzay araçları indiğinde, ordu tarafından dilbilimci Louise Banks işe alınır. Uzaylıların niyetini anlamak için kurulan bu iletişim çabası, zaman kavramını, lisanın algımız üzerindeki etkisini ve insanlığın birlik olma çabalarını büyüleyici bir dille sorguluyor.",
      whyPrompt: "Alışılagelmiş uzaylı istilası filmlerinden tamamen sıyrılan, dilbilim ve zaman teorilerine dayalı entelektüel bir gizemi çözmek için mutlaka izlemelisiniz!",
      visualSearchQuery: "futuristic alien spaceship sky",
      imageUrl: "https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: 4,
      itemTitle: "4. The Matrix (1999)",
      description: "Yapay zekanın dünyayı ele geçirdiği ve insanları bir simülasyonda tutsak ettiği bir geleceği anlatan Matrix, sinema tarihini sonsuza dek değiştirdi. Sıradan bir yazılımcı olan Neo'nun 'seçilmiş kişi' olduğunu keşfetme süreci, akıllara kazınan aksiyon sahneleriyle birleşerek bir felsefi rehber görevi görüyor.",
      whyPrompt: "Yaşadığımız dünyayı ve gerçekliği kökten sorgulamak, sinemada devrim yaratan 'Bullet Time' efektini ve efsanevi dövüş koreografilerini yeniden yaşamak için zamansız bir klasik!",
      visualSearchQuery: "green matrix code server digital",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: 5,
      itemTitle: "5. Dune: Part Two (Çöl Gezegeni 2)",
      description: "Frank Herbert'ın ikonik serisinin beyaz perde uyarlamasında, Paul Atreides'in çölde Fremen halkıyla birleşerek ailesini yok edenlerden intikam alma mücadelesi doruk noktasına ulaşıyor. Dev çöl solucanları, mistik güçler ve politik entrikalarla dolu bu yapım, izleyicisine adeta çölde kaybolma hissi veriyor.",
      whyPrompt: "İnanılmaz ses tasarımlarını duymak, Hans Zimmer'ın tüyleri diken diken eden müzikleriyle Arrakis'in kumlarında devasa bir sinema şölenine tanıklık etmek için kaçırmayın!",
      visualSearchQuery: "desert sand dunes orange sunset",
      imageUrl: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80",
    },
  ],
  closingQuestion: "Sizce sinema tarihinin en iyi bilim kurgu filmi hangisi? Sizin favoriniz bu listede yer alıyor mu? Yorumlarda buluşalım, tartışalım!",
  createdAt: "2026-06-25T02:24:38-07:00",
};

export const SAMPLE_TOPICS = [
  "Mutlaka İzlenmesi Gereken 5 Bilim Kurgu Filmi",
  "Sağlıklı ve Dinç Yaşamak İçin Güne Başlarken Yapılacak 5 Altın Alışkanlık",
  "Yazılıma Yeni Başlayanların Hayatını Kolaylaştıracak 10 Ücretsiz Araç",
  "Avrupa'da Bütçe Dostu Tatil Yapabileceğiniz En Gizemli 5 Şehir",
  "Zaman Yönetimini Ustaca Yapmanızı Sağlayacak 5 Pratik Teknik",
];
