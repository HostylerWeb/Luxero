import type { FaqCategory, FaqItem } from "../content-types";

export const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "general", name: "General" },
  { id: "payment", name: "Plată" },
  { id: "delivery", name: "Livrare" },
];

export const FAQS_BY_CATEGORY: Record<string, FaqItem[]> = {
  general: [
    {
      question: "Cum particip la un concurs?",
      answer:
        "Navighează prin concursurile noastre, selectează premiul dorit, alege câte bilete dorești să cumperi și finalizează procesul de comandă. Vei primi un email de confirmare cu numerele biletelor tale.",
    },
    {
      question: "Cum sunt selectați câștigătorii?",
      answer:
        "Câștigătorii sunt selectați folosind un generator de numere aleatoare verificat (RNG) care alege un număr de bilet câștigător după încheierea concursului. Câștigătorul este notificat prin email în termen de 7 zile de la extragere.",
    },
    {
      question: "Când va avea loc extragerea?",
      answer:
        "Fiecare pagină de concurs arată data și ora programată a extragerii. Extragerile au loc automat odată ce toate biletele sunt vândute sau când numărătoarea inversă ajunge la zero, oricare survine prima.",
    },
    {
      question: "Cum voi ști dacă am câștigat?",
      answer:
        "Vom trimite un email câștigătorului la adresa folosită în timpul achiziției. Numele și premiul câștigătorului vor fi afișate și pe pagina noastră de Câștigători. Asigură-te că emailul contului tău este actualizat.",
    },
    {
      question: "Cât durează livrarea premiului?",
      answer:
        "Odată ce verificarea câștigătorului este completă, premiile sunt de obicei expediate în termen de 14 zile lucrătoare. Livrările în Regatul Unit ajung de obicei în 5-7 zile lucrătoare.",
    },
    {
      question: "Pot primi o rambursare pentru biletele mele?",
      answer:
        "Toate achizițiile de bilete sunt finale și nerambursabile. Participările la concurs rămân valabile chiar dacă data extragerii se modifică.",
    },
    {
      question: "Există restricții de vârstă?",
      answer:
        "Da, trebuie să ai 18 ani sau peste pentru a participa la orice concurs. Verificăm vârsta la înregistrare și la finalizare și ne rezervăm dreptul de a verifica câștigătorii.",
    },
    {
      question: "Pot participa gratuit prin poștă?",
      answer:
        "Da. Participarea gratuită prin poștă este disponibilă pentru concursurile active. Vizitează pagina noastră de Participare gratuită prin poștă pentru adresa poștală și ce trebuie să incluzi (numele complet, adresa, datele de contact, numele concursului și emailul contului Luxero). Participările incomplete nu pot fi acceptate.",
    },
    {
      question: "Pot cumpăra bilete pentru altcineva?",
      answer:
        "Da, poți cumpăra bilete ca cadou. Biletele vor fi atribuite contului tău, dar ne poți notifica după extragere pentru a actualiza detaliile de livrare.",
    },
  ],
  payment: [
    {
      question: "Ce metode de plată acceptați?",
      answer:
        "Acceptăm toate cardurile de credit și debit majore, inclusiv Visa, Mastercard și American Express. Apple Pay și Google Pay sunt, de asemenea, acceptate pentru o finalizare mai rapidă.",
    },
    {
      question: "Informațiile mele de plată sunt sigure?",
      answer:
        "Absolut. Toate plățile sunt procesate prin platforma noastră securizată de plată. Nu stocăm niciodată detaliile cardului tău.",
    },
    {
      question: "Pot folosi un cod promoțional?",
      answer:
        "Da, poți introduce un cod promoțional la finalizare pentru reduceri sau bilete bonus. Codurile promoționale nu pot fi combinate cu alte oferte și au date de expirare.",
    },
  ],
  delivery: [
    {
      question: "Expediați internațional?",
      answer:
        "Da, expediem în majoritatea țărilor din întreaga lume. Costurile și timpii de livrare internațională variază în funcție de destinație. Toate taxele vamale și impozitele de import sunt responsabilitatea destinatarului.",
    },
    {
      question: "Ce se întâmplă dacă nu sunt acasă la livrare?",
      answer:
        "Curierul va încerca de obicei livrarea de două ori înainte de a returna coletul. Recomandăm să furnizezi o locație sigură sau o adresă de birou pentru livrarea premiilor.",
    },
  ],
};

export const FAQ_SUPPORT_EMAIL = "contact@luxero.win";
