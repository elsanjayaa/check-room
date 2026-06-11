import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, onSnapshot, deleteDoc,
  doc, setDoc, query
} from "firebase/firestore";

const FLOORS = [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 16, 17];
const ROOMS = {
  1: [ "101 ",  "102 ",  "103 ",  "105 ",  "106 ",  "107 ",  "108 ",  "109 ",  "110 ",  "111 ",  "112 "],
  2: [ "201 ",  "202 ",  "203 ",  "205 ",  "206 ",  "207 ",  "208 ",  "209 ",  "210 ",  "211 ",  "212 ",  "213 ",  "215 ",  "216 ",  "217 ",  "218 ",  "219 ",  "220 ",  "221 ",  "222 ",  "223 ",  "225 ",  "226 ",  "227 ",  "228 ",  "229 ",  "230 ",  "231 ",  "232 ",  "233 ",  "235 ",  "236 "],
  3: [ "301 ",  "302 ",  "303 ",  "305 ",  "306 ",  "307 ",  "308 ",  "309 ",  "310 ",  "311 ",  "312 ",  "313 ",  "315 ",  "316 ",  "317 ",  "318 ",  "319 ",  "320 ",  "321 ",  "322 ",  "323 ",  "325 ",  "326 ",  "327 ",  "328 ",  "329 ",  "330 ",  "331 ",  "332 ",  "333 ",  "335 ",  "336 ",  "337 ",  "338 ",  "339 ",  "340 ",  "341 ",  "342 ",  "343 "],
  5: [ "501 ",  "502 ",  "503 ",  "505 ",  "506 ",  "507 ",  "508 ",  "509 ",  "510 ",  "511 ",  "512 ",  "513 ",  "515 ",  "516 ",  "517 ",  "518 "],
  6: [ "601 ",  "602 ",  "603 ",  "605 ",  "606 ",  "607 ",  "608 ",  "609 ",  "610 ",  "611 ",  "612 ",  "613 ",  "615 ",  "616 ",  "617 ",  "618 ",  "619 ",  "620 ",  "621 ",  "622 ",  "623 ",  "625 ",  "626 ",  "627 ",  "628 ",  "629 ",  "630 ",  "631 ",  "632 ",  "633 ",  "635 ",  "636 ",  "637 ",  "638 ",  "639 ",  "640 ",  "641 ",  "642 "],
  7: [ "701 ",  "702 ",  "703 ",  "705 ",  "706 ",  "707 ",  "708 ",  "709 ",  "710 ",  "711 ",  "712 ",  "713 ",  "715 ",  "716 ",  "717 ",  "718 ",  "719 ",  "720 ",  "721 ",  "722 ",  "723 ",  "725 ",  "726 ",  "727 ",  "728 ",  "729 ",  "730 ",  "731 ",  "732 ",  "733 ",  "735 ",  "736 ",  "737 ",  "738 ",  "739 ",  "740 ",  "741 ",  "742 ",  "743 "],
  8: [ "801 ",  "802 ",  "803 ",  "805 ",  "806 ",  "807 ",  "808 ",  "809 ",  "810 ",  "811 ",  "812 ",  "813 ",  "815 ",  "816 ",  "817 ",  "818 ",  "819 ",  "820 ",  "821 ",  "822 ",  "823 ",  "825 ",  "826 ",  "827 ",  "828 ",  "829 ",  "830 ",  "831 ",  "832 ",  "833 ",  "835 ",  "836 ",  "837 ",  "838 ",  "839 ",  "840 ",  "841 ",  "842 ",  "843 "],
  9: [ "901 ",  "902 ",  "903 ",  "905 ",  "906 ",  "907 ",  "908 ",  "909 ",  "910 ",  "911 ",  "912 ",  "913 ",  "915 ",  "916 ",  "917 ",  "918 ",  "919 ",  "920 ",  "921 ",  "922 ",  "923 ",  "925 ",  "926 ",  "927 ",  "928 ",  "929 ",  "930 ",  "931 ",  "932 ",  "933 ",  "935 ",  "936 ",  "937 ",  "938 ",  "939 ",  "940 ",  "941 ",  "942 ",  "943 "],
  10: [ "1001 ",  "1002 ",  "1003 ",  "1005 ",  "1006 ",  "1007 ",  "1008 ",  "1009 ",  "1010 ",  "1011 ",  "1012 ",  "1013 ",  "1015 ",  "1016 ",  "1017 ",  "1018 ",  "1019 ",  "1020 ",  "1021 ",  "1022 ",  "1023 ",  "1025 ",  "1026 ",  "1027 ",  "1028 ",  "1029 ",  "1030 ",  "1031 ",  "1032 ",  "1033 ",  "1035 ",  "1036 ",  "1037 ",  "1038 ",  "1039 ",  "1040 ",  "1041 ",  "1042 ",  "1043 ",  "1045 ",  "1046 ",  "1047 ",  "1048 ",  "1049 ",  "1050 ",  "1051 ",  "1052 ",  "1053 ",  "1055 "],
  11: [ "1101 ",  "1102 ",  "1103 ",  "1105 ",  "1106 ",  "1107 ",  "1108 ",  "1109 ",  "1110 ",  "1111 ",  "1112 ",  "1113 ",  "1115 ",  "1116 ",  "1117 ",  "1118 ",  "1119 ",  "1120 ",  "1121 ",  "1122 ",  "1123 ",  "1125 ",  "1126 ",  "1127 ",  "1128 ",  "1129 ",  "1130 ",  "1131 ",  "1132 ",  "1133 ",  "1135 ",  "1136 ",  "1137 ",  "1138 ",  "1139 ",  "1140 ",  "1141 ",  "1142 ",  "1143 ",  "1145 ",  "1146 ",  "1147 ",  "1148 ",  "1149 ",  "1150 ",  "1151 ",  "1152 ",  "1153 ",  "1155 ",  "1156 ",  "1157 ",  "1158 ",  "1159 ",  "1160 ",  "1161 ",  "1162 ",  "1163 "],
  16: [ "1601 ",  "1602 ",  "1603 ",  "1605 ",  "1606 ",  "1607 ",  "1608 ",  "1609 ",  "1610 ",  "1611 ",  "1612 ",  "1613 ",  "1615 ",  "1616 ",  "1617 ",  "1618 ",  "1619 ",  "1620 "],
  17: [ "1701 ",  "1702 ",  "1703 ",  "1705 ",  "1706 ",  "1707 ",  "1708 ",  "1709 ",  "1710 ",  "1711 ",  "1712 ",  "1713 ",  "1715 "]
};
const MONTHS = [ "Jan ",  "Feb ",  "Mar ",  "Apr ",  "Mei ",  "Jun ",  "Jul ",  "Agu ",  "Sep ",  "Okt ",  "Nov ",  "Des "];
const today = new Date();
const yesterday = new Date(Date.now() - 86400000);
const toDateStr = d => d.toISOString().split("T")[0];
const todayStr = toDateStr(today);
const makeDocId = (tanggal, lantai, kamar) => `${tanggal}_lt${lantai}_${kamar.replace(/\s/g, "")}`;

const EMPTY = {
  lantai: " ", kamar: " ",
  doorBefore: " ", doorAfter: " ", catatanDoor: " ",
  batreLowbat: false,
  batreExpired: false,
  bateraiList: [],
  channelInput: " ", channelRusak: [],
  catatan: " "
};

function selisihWaktu(before, after) {
  if (!before || !after) return null;
  const toSec = t => { const [h, m, s] = t.split(":").map(Number); return h * 3600 + m * 60 + (s || 0); };
  const diff = Math.abs(toSec(after) - toSec(before));
  if (diff === 0) return null;
  const j = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
  if (j > 0) return `${j} jam ${m} menit ${s} detik`;
  if (m > 0) return `${m} menit ${s} detik`;
  return `${s} detik`;
}

function fmt(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function fmtTanggal(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function fmtExpired(bulan, tahun) {
  if (!bulan && !tahun) return "—";
  return `${MONTHS[Number(bulan) - 1] || ""} ${tahun}`.trim();
}

function fmtBateraiList(list) {
  if (!list || list.length === 0) return "—";
  return list.map(b => fmtExpired(b.bulan, b.tahun)).join(", ");
}

function Badge({ text, color }) {
  return <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: "0.3px" }}>{text}</span>;
}

function Toast({ msg, ok, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 99999, background: ok ? "#16a34a" : "#dc2626", color: "#fff", padding: "12px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, boxShadow: "0 8px 30px rgba(0,0,0,0.4)", whiteSpace: "nowrap", border: "1px solid rgba(255,255,255,0.1)" }}>
      {msg}
    </div>
  );
}

function PrintView({ data, tanggal, lantai, onClose }) {
  const [savingPdf, setSavingPdf] = useState(false);
  
  const filtered = data
    .filter(d => d.tanggal === tanggal && (lantai === "all" || d.lantai === Number(lantai)))
    .sort((a, b) => a.lantai - b.lantai || a.kamar.localeCompare(b.kamar));
    
  const grouped = {};
  filtered.forEach(d => { if (!grouped[d.lantai]) grouped[d.lantai] = []; grouped[d.lantai].push(d); });
  
  const handleSavePdf = async () => {
    setSavingPdf(true);
    try {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      document.head.appendChild(script);
      await new Promise(r => { script.onload = r; });
      const filename = `laporan-${tanggal}${lantai !== "all" ? "-lt" + lantai : "-semua"}.pdf`;
      await window.html2pdf().set({
        margin: [10, 10, 10, 10], filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(document.getElementById("print-area")).save();
    } catch { alert("Gagal simpan PDF, gunakan tombol Print → Save as PDF."); }
    setSavingPdf(false);
  };

  const th = () => ({ border: "1px solid #ccc", padding: "8px 10px", background: "#f1f5f9", fontSize: 10, fontWeight: 800, color: "#0f172a", textAlign: "left", letterSpacing: "0.5px" });
  const td = (x = {}) => ({ border: "1px solid #e2e8f0", padding: "6px 10px", fontSize: 10, verticalAlign: "top", lineHeight: 1.5, color: "#334155", ...x });

  return (
    <>
      <style>{`
        @media print { 
          body > * { display:none !important; } 
          #print-modal { display:block !important; position:static !important; background:none !important; padding:0 !important; } 
          #no-print { display:none !important; } 
          #print-area { box-shadow:none !important; padding:15mm !important; max-width:100% !important; background: #fff !important; color: #000 !important; } 
          #print-area * { color: #000 !important; } 
          .floor-section { page-break-before: always; } 
          .floor-section:first-child { page-break-before: auto; } 
        } 
        @page { size:A4 portrait; margin:0; }
      `}</style>
      <div id="print-modal" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9000, overflowY: "auto", padding: "20px 16px" }}>
        <div id="no-print" style={{ maxWidth: 760, margin: "0 auto 16px", display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ color: "#94a3b8", fontSize: 12, marginRight: "auto", fontFamily: "'DM Mono', monospace" }}>PREVIEW A4 · {filtered.length} KAMAR</span>
          <button onClick={onClose} style={{ padding: "8px 18px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: "#fff", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>Tutup</button>
          <button onClick={() => window.print()} style={{ padding: "8px 18px", background: "rgba(212, 175, 55, 0.2)", border: "1px solid #d4af37", borderRadius: 8, color: "#d4af37", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Print</button>
          <button onClick={handleSavePdf} disabled={savingPdf} style={{ padding: "8px 18px", background: savingPdf ? "#475569" : "#d4af37", border: "none", borderRadius: 8, color: "#0f0f0f", fontWeight: 800, fontSize: 12, cursor: savingPdf ? "not-allowed" : "pointer" }}>
            {savingPdf ? "Menyimpan..." : "Simpan PDF"}
          </button>
        </div>
        <div id="print-area" style={{ maxWidth: 760, margin: "0 auto", background: "#fff", padding: "14px 18px", boxShadow: "0 8px 40px rgba(0,0,0,0.35)", fontFamily: "Arial, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #0f172a", paddingBottom: 8, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0f172a", letterSpacing: "1px" }}>LAPORAN PENGECEKAN KAMAR</div>
              <div style={{ fontSize: 8, color: "#475569", marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                TANGGAL: <b>{fmtTanggal(tanggal).toUpperCase()}</b>   LANTAI: <b>{lantai === "all" ? "SEMUA" : "LANTAI " + lantai}</b>   TOTAL: <b>{filtered.length} KAMAR</b>
              </div>
            </div>
            <div style={{ fontSize: 8, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>DICETAK: {new Date().toLocaleString("id-ID")}</div>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8", fontSize: 11 }}>TIDAK ADA DATA UNTUK FILTER INI</div>
          ) : Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map((lt, index) => (
            <div key={lt} className="floor-section" style={{ marginBottom: 16, pageBreakBefore: index > 0 ? 'always' : 'auto' }}>
              <div style={{ background: "#0f172a", color: "#fff", padding: "4px 10px", fontSize: 9, fontWeight: 800, display: "flex", justifyContent: "space-between", letterSpacing: "1px" }}>
                <span>LANTAI {lt}</span> <span>{grouped[lt].length} KAMAR</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 0 }}>
                <thead>
                  <tr>
                    <th style={th()}>KAMAR</th>
                    <th style={th()}>BEFORE</th>
                    <th style={th()}>AFTER</th>
                    <th style={th()}>DURASI</th>
                    <th style={th()}>EXP. BATERAI</th>
                    <th style={th()}>CH. RUSAK</th>
                    <th style={th()}>CATATAN DOOR</th>
                    <th style={th()}>CATATAN UMUM</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[lt].map((row, i) => (
                    <tr key={row.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                      <td style={td({ fontWeight: 800, color: "#0f172a" })}>{row.kamar}</td>
                      <td style={td({ fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", fontSize: 9 })}>{row.doorBefore || "—"}</td>
                      <td style={td({ fontFamily: "'DM Mono', monospace", whiteSpace: "nowrap", fontSize: 9 })}>{row.doorAfter || "—"}</td>
                      <td style={td({ color: "#16a34a", fontWeight: 700, fontSize: 9 })}>{selisihWaktu(row.doorBefore, row.doorAfter) || "—"}</td>
                      <td style={td({ fontSize: 9 })}>{fmtBateraiList(row.bateraiList)}</td>
                      <td style={td({ color: row.channelRusak?.length ? "#dc2626" : "#94a3b8", wordBreak: "break-word", fontSize: 9 })}>{row.channelRusak?.join(", ") || "—"}</td>
                      <td style={td({ wordBreak: "break-word", fontSize: 9 })}>{row.catatanDoor || "—"}</td>
                      <td style={td({ wordBreak: "break-word", fontSize: 9 })}>{row.catatan || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div style={{ borderTop: "1px solid #cbd5e1", marginTop: 16, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 8, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
            <span>HOTEL ROOM CHECK SYSTEM</span> <span>{new Date().toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [tab, setTab] = useState("form");
  const [form, setForm] = useState(EMPTY);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterLantai, setFilterLantai] = useState("all");
  const [filterTanggal, setFilterTanggal] = useState(todayStr);
  const [showPrint, setShowPrint] = useState(false);
  const [printTanggal, setPrintTanggal] = useState(todayStr);
  const [printLantai, setPrintLantai] = useState("all");
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [bateraiBulan, setBateraiBulan] = useState("");
  const [bateraiTahun, setBateraiTahun] = useState("");

  const showToast = (msg, ok = true) => setToast({ msg, ok });

  useEffect(() => {
    const q = query(collection(db, "pengecekan"));
    const unsub = onSnapshot(q, snap => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addChannel = () => {
    if (!form.channelInput.trim()) return;
    setForm(f => ({ ...f, channelRusak: [...f.channelRusak, f.channelInput.trim()], channelInput: "" }));
  };

  const removeChannel = i => setForm(f => ({ ...f, channelRusak: f.channelRusak.filter((_, idx) => idx !== i) }));

  const addBaterai = () => {
    if (!bateraiBulan || !bateraiTahun) return;
    setForm(f => ({
      ...f,
      bateraiList: [...f.bateraiList, { id: Date.now(), bulan: bateraiBulan, tahun: bateraiTahun }]
    }));
    setBateraiBulan("");
    setBateraiTahun("");
  };

  const removeBaterai = id => setForm(f => ({ ...f, bateraiList: f.bateraiList.filter(b => b.id !== id) }));

  const handleSubmit = async () => {
    if (!form.lantai || !form.kamar.trim()) { showToast("Lantai dan nomor kamar wajib diisi!", false); return; }
    setSaving(true);
    try {
      const tanggal = todayStr;
      const docId = editId || makeDocId(tanggal, form.lantai, form.kamar);
      const existing = data.find(d => d.id === docId);
      
      const getVal = (val, existingVal) => {
        if (typeof val === 'string' && val.trim() !== " ") return val.trim();
        return editId ? " " : (existingVal || " ");
      };

      const mergeArrays = (newArr, oldArr) => {
        if (!newArr || newArr.length === 0) return oldArr || [];
        if (!oldArr || oldArr.length === 0) return newArr;
        return [...new Set([...oldArr, ...newArr])];
      };

      const mergeBaterai = (newList, oldList) => {
        if (!newList || newList.length === 0) return oldList || [];
        if (!oldList || oldList.length === 0) return newList;
        const combined = [...oldList, ...newList];
        return combined.filter((item, index, self) => 
          index === self.findIndex((t) => (t.bulan === item.bulan && t.tahun === item.tahun))
        );
      };

      const payload = {
        tanggal,
        lantai: Number(form.lantai),
        kamar: form.kamar.trim(),
        doorBefore: getVal(form.doorBefore, existing?.doorBefore),
        doorAfter: getVal(form.doorAfter, existing?.doorAfter),
        catatanDoor: getVal(form.catatanDoor, existing?.catatanDoor),
        catatan: getVal(form.catatan, existing?.catatan),
        batreLowbat: form.batreLowbat || existing?.batreLowbat || false,
        batreExpired: form.batreExpired || existing?.batreExpired || false,
        bateraiList: editId ? form.bateraiList : mergeBaterai(form.bateraiList, existing?.bateraiList),
        channelRusak: editId ? form.channelRusak : mergeArrays(form.channelRusak, existing?.channelRusak),
        updatedAt: new Date().toISOString(),
      };
      
      if (!existing) payload.createdAt = new Date().toISOString();

      await setDoc(doc(db, "pengecekan", docId), payload, { merge: true });
      showToast(existing ? `Data kamar ${form.kamar} berhasil digabung ✓` : `Data kamar ${form.kamar} disimpan ✓`);
      setForm(EMPTY);
      setBateraiBulan(" ");
      setBateraiTahun(" ");
      setEditId(null);
    } catch (e) { showToast("Gagal menyimpan: " + e.message, false); }
    setSaving(false);
  };

  const handleEdit = row => {
    setForm({
      ...EMPTY,
      lantai: String(row.lantai),
      kamar: row.kamar,
      doorBefore: row.doorBefore || "",
      doorAfter: row.doorAfter || "",
      catatanDoor: row.catatanDoor || "",
      batreLowbat: row.batreLowbat || false,
      batreExpired: row.batreExpired || false,
      bateraiList: row.bateraiList || [],
      channelRusak: row.channelRusak || [],
      catatan: row.catatan || ""
    });
    setEditId(row.id);
    setTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async id => {
    try {
      if (id === "__all__") {
        const { getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "pengecekan"));
        // PERBAIKAN: Hanya hapus data yang tanggalnya sama dengan hari ini (todayStr)
        const docsToDelete = snap.docs.filter(d => d.data().tanggal === todayStr);
        if (docsToDelete.length === 0) {
          showToast("Tidak ada data hari ini untuk dihapus", false);
        } else {
          await Promise.all(docsToDelete.map(d => deleteDoc(doc(db, "pengecekan", d.id))));
          showToast(`${docsToDelete.length} data hari ini berhasil dihapus`);
        }
      } else {
        await deleteDoc(doc(db, "pengecekan", id));
        showToast("Data dihapus");
      }
    } catch (e) { showToast("Gagal hapus: " + e.message, false); }
    setConfirmDelete(null);
  };

  const grouped = {};
  const filtered = data
    .filter(d => d.tanggal === filterTanggal)
    .filter(d => filterLantai === "all" || d.lantai === Number(filterLantai));
  filtered.forEach(d => { if (!grouped[d.lantai]) grouped[d.lantai] = []; grouped[d.lantai].push(d); });
  
  const printCount = data.filter(d => d.tanggal === printTanggal && (printLantai === "all" || d.lantai === Number(printLantai))).length;
  const yearOptions = Array.from({ length: 10 }, (_, i) => 2025 + i);
  
  const theme = {
    bg: "#0f0f0f",
    card: "#1a1a1a",
    cardBorder: "#2a2a2a",
    inputBg: "#262626",
    inputBorder: "#333333",
    text: "#f5f5f5",
    textMuted: "#a3a3a3",
    gold: "#d4af37",
    goldHover: "#b8860b",
    goldBg: "rgba(212, 175, 55, 0.1)",
    danger: "#dc2626",
    dangerBg: "rgba(220, 38, 38, 0.1)",
    success: "#16a34a",
    successBg: "rgba(22, 163, 74, 0.1)"
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'); 
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;} 
        body{background:${theme.bg};font-family:'Plus Jakarta Sans',sans-serif; color: ${theme.text};} 
        input,select,textarea{font-family:'Plus Jakarta Sans',sans-serif;} 
        input:focus,select:focus,textarea:focus{outline:none;} 
        .inp:focus{border-color:${theme.gold} !important; box-shadow:0 0 0 3px rgba(212, 175, 55, 0.15) !important;} 
        .row-hover:hover{background:${theme.inputBg} !important;} 
        ::-webkit-scrollbar{width:6px;} 
        ::-webkit-scrollbar-thumb{background:${theme.cardBorder};border-radius:4px;} 
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}} 
        .fade-up{animation:fadeUp 0.35s ease both;} 
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;} 
        .grid-2-print{display:grid;grid-template-columns:1fr 1fr;gap:20px;} 
        .main-container { padding: 24px 40px !important; }
        @media(max-width:600px){ 
          .main-container { padding: 16px !important; }
          .grid-2{grid-template-columns:1fr !important;} 
          .grid-2-print{grid-template-columns:1fr !important;} 
          .card-pad{padding:16px !important;} 
          .header-sub{display:none;} 
          .header-title-sub{display:none !important;} 
          .filter-scroll{overflow-x:auto;padding-bottom:4px;flex-wrap:nowrap !important;} 
          .filter-scroll button{flex-shrink:0;} 
          .row-actions{flex-direction:column !important;} 
          .row-actions button{width:100% !important;text-align:center;} 
          .nav-tab span.tab-label{display:none;} 
          .nav-tab{padding:8px 6px !important;border-radius:8px !important;flex-direction:column !important;gap:2px !important;min-width:48px;align-items:center;justify-content:center;} 
          .nav-tab span.tab-icon{font-size:16px !important;} 
          .nav-tab span.tab-label-sm{display:block !important;font-size:9px !important;font-weight:700;letter-spacing:0.3px;} 
        } 
        .nav-tab span.tab-label-sm{display:none;}
      `}</style>
      
      {toast && <Toast msg={toast.msg} ok={toast.ok} onDone={() => setToast(null)} />}
      {showPrint && <PrintView data={data} tanggal={printTanggal} lantai={printLantai} onClose={() => setShowPrint(false)} />}

      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 8000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: theme.card, borderRadius: 16, padding: "28px 32px", maxWidth: 320, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.5)", border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: theme.text, marginBottom: 8 }}>
              {confirmDelete === "__all__" ? "Hapus semua data hari ini?" : "Hapus data ini?"}
            </div>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 22 }}>
              {confirmDelete === "__all__" 
                ? "Hanya data dengan tanggal hari ini yang akan dihapus permanen." 
                : "Tindakan ini tidak bisa dikembalikan"}
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "9px 20px", borderRadius: 8, border: `1.5px solid ${theme.cardBorder}`, background: "transparent", color: theme.textMuted, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>Batal</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: theme.danger, color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight: "100vh", background: theme.bg }}>
        <div style={{ background: "#111", borderBottom: `1px solid ${theme.cardBorder}`, padding: "0 16px", display: "flex", alignItems: "center", gap: 12, height: 56, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: theme.gold, letterSpacing: "0.5px" }}>CheckRoom</div>
            <div className="header-title-sub" style={{ fontSize: 9, color: "#666", fontFamily: "'DM Mono',monospace", letterSpacing: 1.5 }}>Room Maintenance System</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            {[["form", "📋", "Input"], ["data", "🗄️", "Data"], ["status", "🏨", "Status"], ["print", "🖨️", "Print"]].map(([t, icon, label]) => (
              <button key={t} onClick={() => setTab(t)} className="nav-tab" style={{ 
                padding: "8px 12px", borderRadius: 8, border: tab === t ? `1px solid ${theme.gold}44` : "1px solid transparent", 
                background: tab === t ? theme.goldBg : "transparent", 
                color: tab === t ? theme.gold : theme.textMuted, 
                fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 5 
              }}>
                <span className="tab-icon">{icon}</span> <span className="tab-label">{label}</span> <span className="tab-label-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: "100%", margin: "0 auto", boxSizing: "border-box" }} className="main-container">

          {tab === "form" && (
            <div className="fade-up">
              <div style={{ background: theme.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.2)", overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                <div style={{ background: `linear-gradient(135deg, #1a1a1a, #262626)`, padding: "18px 20px", borderBottom: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: theme.gold }}>{editId ? "Edit Data Kamar" : "Pengecekan Kamar"}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                    {editId ? "Ubah data lalu klik Perbarui" : `DATA HARI INI (${fmtTanggal(todayStr).toUpperCase()}) — KAMAR SAMA AKAN DIGABUNG`}
                  </div>
                </div>
                <div className="card-pad" style={{ padding: "24px 20px" }}>
                  <div className="grid-2" style={{ marginBottom: 20 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.gold, letterSpacing: 1, marginBottom: 8 }}>LANTAI</label>
                      <select value={form.lantai} onChange={e => setForm(f => ({ ...f, lantai: e.target.value }))} className="inp"
                        style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, fontSize: 14, color: form.lantai ? theme.text : theme.textMuted, background: theme.inputBg }}>
                        <option value=" ">Pilih lantai...</option>
                        {FLOORS.map(l => <option key={l} value={l}>Lantai {l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.gold, letterSpacing: 1, marginBottom: 8 }}>NOMOR KAMAR</label>
                      <select value={form.kamar} onChange={e => setForm(f => ({ ...f, kamar: e.target.value }))} className="inp" style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, fontSize: 14, background: theme.inputBg, color: theme.text }}>
                        <option value=" ">Pilih kamar...</option>
                        {(ROOMS[form.lantai] || []).map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {form.lantai && form.kamar && (() => {
                    const existing = data.find(d => d.id === makeDocId(todayStr, form.lantai, form.kamar));
                    if (!existing) return null;
                    return (
                      <div style={{ background: "rgba(212, 175, 55, 0.1)", border: `1.5px solid ${theme.gold}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12, color: theme.gold, display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 16 }}>⚠️</span>
                        <span>Kamar <b>{form.kamar}</b> hari ini sudah ada data. Input akan <b>digabungkan</b>.</span>
                      </div>
                    );
                  })()}

                  <div style={{ background: theme.inputBg, borderRadius: 12, padding: "20px", marginBottom: 20, border: `1px solid ${theme.cardBorder}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: theme.gold, marginBottom: 16, letterSpacing: "0.5px" }}>DOOR LOCK <span style={{ fontSize: 11, fontWeight: 400, color: theme.textMuted }}>(BOLEH DIKOSONGKAN)</span></div>
                    <div className="grid-2" style={{ marginBottom: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: 0.5, marginBottom: 6 }}>WAKTU BEFORE</label>
                        <input type="time" step="1" value={form.doorBefore} onChange={e => setForm(f => ({ ...f, doorBefore: e.target.value }))} className="inp"
                          style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, fontSize: 14, background: theme.card, color: theme.text }} />
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: 0.5, marginBottom: 6 }}>WAKTU AFTER</label>
                        <input type="time" step="1" value={form.doorAfter} onChange={e => setForm(f => ({ ...f, doorAfter: e.target.value }))} className="inp"
                          style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, fontSize: 14, background: theme.card, color: theme.text }} />
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: 0.5, marginBottom: 6 }}>TAMBAH BATERAI EXPIRED</label>
                      <div className="grid-2" style={{ gap: 10, marginBottom: 10 }}>
                        <select value={bateraiBulan} onChange={e => setBateraiBulan(e.target.value)} className="inp"
                          style={{ padding: "10px 12px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, fontSize: 14, background: theme.card, color: bateraiBulan ? theme.text : theme.textMuted }}>
                          <option value=" ">Bulan...</option>
                          {MONTHS.map((m, i) => <option key={i + 1} value={String(i + 1).padStart(2, "0")}>{m}</option>)}
                        </select>
                        <select value={bateraiTahun} onChange={e => setBateraiTahun(e.target.value)} className="inp"
                          style={{ padding: "10px 12px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, fontSize: 14, background: theme.card, color: bateraiTahun ? theme.text : theme.textMuted }}>
                          <option value=" ">Tahun...</option>
                          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <button onClick={addBaterai} style={{ width: "100%", padding: "10px", background: theme.goldBg, color: theme.gold, border: `1px solid ${theme.gold}44`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: "pointer", letterSpacing: "0.5px" }}>+ TAMBAH BATERAI</button>
                    </div>

                    {form.bateraiList.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                        {form.bateraiList.map((b) => (
                          <span key={b.id} style={{ background: "rgba(212, 175, 55, 0.15)", color: theme.gold, border: `1px solid ${theme.gold}33`, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                            {fmtExpired(b.bulan, b.tahun)} <span onClick={() => removeBaterai(b.id)} style={{ cursor: "pointer", opacity: 0.7, fontSize: 14 }}>✕</span>
                          </span>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: 12, color: theme.textMuted, fontStyle: "italic", marginBottom: 16 }}>Belum ada baterai ditambahkan</div>}

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: "block", fontSize: 10, fontWeight: 700, color: theme.textMuted, letterSpacing: 0.5, marginBottom: 6 }}>CATATAN DOOR LOCK</label>
                      <input type="text" value={form.catatanDoor} onChange={e => setForm(f => ({ ...f, catatanDoor: e.target.value }))} placeholder="Misal: Pintu tidak bisa dibuka..." className="inp"
                        style={{ width: "100%", padding: "10px 12px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, fontSize: 14, background: theme.card, color: theme.text }} />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 12, borderTop: `1px solid ${theme.cardBorder}` }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none" }}>
                        <input type="checkbox" checked={form.batreLowbat} onChange={e => setForm(f => ({ ...f, batreLowbat: e.target.checked }))}
                          style={{ width: 18, height: 18, accentColor: "#f59e0b", cursor: "pointer", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b" }}>BATERAI LOWBAT</span>
                      </label>
                      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer", userSelect: "none" }}>
                        <input type="checkbox" checked={form.batreExpired} onChange={e => setForm(f => ({ ...f, batreExpired: e.target.checked }))}
                          style={{ width: 18, height: 18, accentColor: "#dc2626", cursor: "pointer", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#dc2626" }}>BATERAI EXPIRED</span>
                      </label>
                    </div>
                  </div>

                  <div style={{ background: theme.inputBg, borderRadius: 12, padding: "20px", marginBottom: 20, border: `1px solid ${theme.cardBorder}` }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: theme.gold, marginBottom: 16, letterSpacing: "0.5px" }}>CHANNEL TV RUSAK <span style={{ fontSize: 11, fontWeight: 400, color: theme.textMuted }}>(BOLEH DIKOSONGKAN)</span></div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                      <input type="text" value={form.channelInput} onChange={e => setForm(f => ({ ...f, channelInput: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && addChannel()} placeholder="Ketik nama channel, tekan Enter..." className="inp"
                        style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 8, fontSize: 14, background: theme.card, color: theme.text }} />
                      <button onClick={addChannel} style={{ padding: "10px 18px", background: theme.gold, color: "#0f0f0f", border: "none", borderRadius: 8, fontWeight: 800, fontSize: 12, cursor: "pointer", letterSpacing: "0.5px" }}>+ TAMBAH</button>
                    </div>
                    {form.channelRusak.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {form.channelRusak.map((ch, i) => (
                          <span key={i} style={{ background: theme.dangerBg, color: "#f87171", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                            {ch} <span onClick={() => removeChannel(i)} style={{ cursor: "pointer", opacity: 0.7, fontSize: 14 }}>✕</span>
                          </span>
                        ))}
                      </div>
                    ) : <div style={{ fontSize: 12, color: theme.textMuted, fontStyle: "italic" }}>Belum ada channel ditambahkan</div>}
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.gold, letterSpacing: 1, marginBottom: 8 }}>CATATAN UMUM <span style={{ fontSize: 11, fontWeight: 400, color: theme.textMuted }}>(BOLEH DIKOSONGKAN)</span></label>
                    <textarea value={form.catatan} onChange={e => setForm(f => ({ ...f, catatan: e.target.value }))} placeholder="Catatan tambahan lainnya..." className="inp" rows={3}
                      style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, fontSize: 14, background: theme.inputBg, color: theme.text, resize: "vertical" }} />
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    {editId && (
                      <button onClick={() => { setEditId(null); setForm(EMPTY); setBateraiBulan(" "); setBateraiTahun(" "); }} style={{ padding: "14px 20px", background: "transparent", color: theme.textMuted, border: `1.5px solid ${theme.cardBorder}`, borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>BATAL</button>
                    )}
                    <button onClick={handleSubmit} disabled={saving}
                      style={{ flex: 1, padding: "14px", background: saving ? "#475569" : theme.gold, color: "#0f0f0f", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer", boxShadow: `0 4px 14px ${theme.gold}44`, opacity: saving ? 0.8 : 1, letterSpacing: "0.5px" }}>
                      {saving ? "MENYIMPAN..." : editId ? "PERBARUI DATA" : "SIMPAN KE DATABASE"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "data" && (
            <div className="fade-up">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, gap: 10, flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", width: "100%" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.gold, letterSpacing: 1, flexShrink: 0 }}>TANGGAL: </span>
                  <button onClick={() => setFilterTanggal(todayStr)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filterTanggal === todayStr ? theme.gold : theme.card, color: filterTanggal === todayStr ? "#0f0f0f" : theme.textMuted, fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", letterSpacing: "0.5px" }}>HARI INI</button>
                  <button onClick={() => setFilterTanggal(toDateStr(yesterday))} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filterTanggal === toDateStr(yesterday) ? theme.gold : theme.card, color: filterTanggal === toDateStr(yesterday) ? "#0f0f0f" : theme.textMuted, fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", letterSpacing: "0.5px" }}>KEMARIN</button>
                  <input type="date" value={filterTanggal} onChange={e => setFilterTanggal(e.target.value)}
                    style={{ padding: "6px 10px", border: `1.5px solid ${theme.cardBorder}`, borderRadius: 8, fontSize: 12, background: filterTanggal !== todayStr && filterTanggal !== toDateStr(yesterday) ? theme.goldBg : theme.card, color: theme.text, fontFamily: "'Plus Jakarta Sans',sans-serif", cursor: "pointer" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, gap: 10, flexWrap: "wrap" }}>
                <div className="filter-scroll" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.gold, letterSpacing: 1 }}>LANTAI: </span>
                  {["all", ...FLOORS.map(String)].filter(l => l === "all" || data.some(d => d.lantai === Number(l) && d.tanggal === filterTanggal)).map(l => (
                    <button key={l} onClick={() => setFilterLantai(l)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: filterLantai === l ? theme.gold : theme.card, color: filterLantai === l ? "#0f0f0f" : theme.textMuted, fontWeight: 700, fontSize: 11, cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.2)", letterSpacing: "0.5px" }}>
                      {l === "all" ? "SEMUA" : "LT. " + l}
                    </button>
                  ))}
                </div>
                {/* PERBAIKAN: Teks tombol diubah agar lebih jelas bahwa ini hanya menghapus data hari ini */}
                <button onClick={() => setConfirmDelete("__all__")} style={{ padding: "7px 16px", background: theme.dangerBg, color: "#f87171", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", flexShrink: 0, letterSpacing: "0.5px" }}>HAPUS HARI INI</button>
              </div>
              {loading ? (
                <div style={{ textAlign: "center", padding: 60, color: theme.textMuted, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>MEMUAT DATA DARI FIREBASE...</div>
              ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: theme.textMuted }}>
                  <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📭</div>
                  <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "0.5px" }}>BELUM ADA DATA</div>
                </div>
              ) : Object.keys(grouped).sort((a, b) => Number(a) - Number(b)).map(lantai => (
                <div key={lantai} style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{ background: theme.gold, color: "#0f0f0f", borderRadius: 6, padding: "5px 14px", fontSize: 12, fontWeight: 800, letterSpacing: "1px" }}>LANTAI {lantai}</div>
                    <div style={{ flex: 1, height: 1, background: theme.cardBorder }}></div>
                    <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: "'DM Mono',monospace" }}>{grouped[lantai].length} KAMAR</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {grouped[lantai].sort((a, b) => a.kamar.localeCompare(b.kamar)).map(row => (
                      <div key={row.id} className="row-hover" style={{ background: theme.card, borderRadius: 12, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.15)", transition: "background 0.15s", border: `1px solid ${theme.cardBorder}` }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                              <span style={{ fontWeight: 800, fontSize: 16, color: theme.text }}>KAMAR {row.kamar}</span>
                              <span style={{ fontSize: 10, color: theme.textMuted, fontFamily: "'DM Mono',monospace", background: theme.inputBg, borderRadius: 4, padding: "2px 8px", border: `1px solid ${theme.cardBorder}` }}>{row.tanggal}</span>
                              {row.batreLowbat && <Badge text="LOWBAT" color="#f59e0b" />}
                              {row.batreExpired && <Badge text="EXPIRED" color="#dc2626" />}
                              {row.channelRusak?.length > 0 && <Badge text={`${row.channelRusak.length} CH RUSAK`} color="#dc2626" />}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", marginBottom: 8 }}>
                              {row.doorBefore && <span style={{ fontSize: 12, color: theme.textMuted }}>BEFORE: <strong style={{ color: theme.text, fontFamily: "'DM Mono', monospace" }}>{row.doorBefore}</strong></span>}
                              {row.doorAfter && <span style={{ fontSize: 12, color: theme.textMuted }}>AFTER: <strong style={{ color: theme.text, fontFamily: "'DM Mono', monospace" }}>{row.doorAfter}</strong></span>}
                              {row.bateraiList?.length > 0 && (
                                <span style={{ fontSize: 12, color: theme.textMuted }}>EXP: <strong style={{ color: theme.gold }}>{fmtBateraiList(row.bateraiList)}</strong></span>
                              )}
                            </div>
                            {selisihWaktu(row.doorBefore, row.doorAfter) && (
                              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: theme.successBg, border: "1px solid rgba(22, 163, 74, 0.3)", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#4ade80", fontWeight: 700, marginBottom: 8, fontFamily: "'DM Mono',monospace", letterSpacing: "0.5px" }}>
                                DURASI: {selisihWaktu(row.doorBefore, row.doorAfter)}
                              </div>
                            )}
                            {row.channelRusak?.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                                {row.channelRusak.map((ch, i) => <Badge key={i} text={ch} color="#94a3b8" />)}
                              </div>
                            )}
                            {(row.catatanDoor || row.catatan) && (
                              <div style={{ fontSize: 12, color: theme.textMuted, display: "flex", flexDirection: "column", gap: 4, borderTop: `1px solid ${theme.cardBorder}`, paddingTop: 8, marginTop: 4 }}>
                                {row.catatanDoor && row.catatanDoor.trim() !== " " && row.catatanDoor.trim() !== "  " && (
                                  <div><strong style={{ color: theme.gold }}>Catatan Door:</strong> {row.catatanDoor}</div>
                                )}
                                {row.catatan && row.catatan.trim() !== " " && row.catatan.trim() !== "  " && (
                                  <div><strong style={{ color: theme.gold }}>Catatan Umum:</strong> {row.catatan}</div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="row-actions" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                            <button onClick={() => handleEdit(row)} style={{ padding: "8px 16px", background: theme.goldBg, color: theme.gold, border: `1px solid ${theme.gold}44`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>EDIT</button>
                            <button onClick={() => setConfirmDelete(row.id)} style={{ padding: "8px 16px", background: theme.dangerBg, color: "#f87171", border: "1px solid rgba(220, 38, 38, 0.3)", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>HAPUS</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "status" && (
            <div className="fade-up">
              <div style={{ background: theme.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.2)", overflow: "hidden", marginBottom: 20, border: `1px solid ${theme.cardBorder}` }}>
                <div style={{ background: `linear-gradient(135deg, #1a1a1a, #262626)`, padding: "18px 20px", borderBottom: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: theme.gold, letterSpacing: "0.5px" }}>STATUS PENGECEKAN</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>TERAKHIR DICEK PER LANTAI BERDASARKAN SELURUH DATA</div>
                </div>
                <div style={{ padding: "20px" }}>
                  {loading ? (
                    <div style={{ textAlign: "center", padding: 40, color: theme.textMuted, fontSize: 14, fontFamily: "'DM Mono', monospace" }}>MEMUAT DATA...</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {FLOORS.map(lt => {
                        const roomsOnFloor = data.filter(d => d.lantai === lt);
                        const sorted = [...roomsOnFloor].sort((a, b) => (b.updatedAt || b.createdAt || " ").localeCompare(a.updatedAt || a.createdAt || " "));
                        const last = sorted[0];
                        const todayCount = roomsOnFloor.filter(d => d.tanggal === todayStr).length;
                        const lastTanggal = last?.tanggal;
                        const isToday = lastTanggal === todayStr;
                        const isYesterday = lastTanggal === toDateStr(yesterday);
                        const statusColor = !last ? theme.textMuted : isToday ? theme.success : isYesterday ? "#f59e0b" : theme.danger;
                        const statusBg = !last ? theme.inputBg : isToday ? theme.successBg : isYesterday ? "rgba(245, 158, 11, 0.1)" : theme.dangerBg;
                        const statusText = !last ? "BELUM ADA DATA" : isToday ? "HARI INI" : isYesterday ? "KEMARIN" : lastTanggal;
                        return (
                          <div key={lt} style={{ background: statusBg, border: `1.5px solid ${statusColor}33`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ background: statusColor, color: !last || isToday ? "#0f0f0f" : "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 800, minWidth: 60, textAlign: "center", flexShrink: 0, letterSpacing: "1px" }}>
                              LT. {lt}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <span style={{ fontWeight: 700, fontSize: 14, color: theme.text }}>
                                  {last ? `${roomsOnFloor.length} KAMAR TERCATAT` : "BELUM PERNAH DICEK"}
                                </span>
                                {todayCount > 0 && (
                                  <span style={{ background: theme.successBg, color: "#4ade80", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: "0.5px" }}>{todayCount} HARI INI</span>
                                )}
                              </div>
                              {last && (
                                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>
                                  TERAKHIR: <span style={{ fontWeight: 700, color: statusColor }}>{statusText}</span>
                                  {last.kamar && <span style={{ color: theme.textMuted }}> · KAMAR {last.kamar}</span>}
                                  {(last.updatedAt || last.createdAt) && (
                                    <span style={{ color: theme.textMuted }}> · {fmt(last.updatedAt || last.createdAt)}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div style={{ flexShrink: 0 }}>
                              <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColor, boxShadow: `0 0 8px ${statusColor}88` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {tab === "print" && (
            <div className="fade-up">
              <div style={{ background: theme.card, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.2)", overflow: "hidden", border: `1px solid ${theme.cardBorder}` }}>
                <div style={{ background: `linear-gradient(135deg, #1a1a1a, #262626)`, padding: "18px 20px", borderBottom: `1px solid ${theme.cardBorder}` }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: theme.gold, letterSpacing: "0.5px" }}>PRINT LAPORAN</div>
                  <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>PILIH TANGGAL DAN LANTAI, LALU CETAK KE KERTAS A4</div>
                </div>
                <div style={{ padding: "24px 20px" }}>
                  <div className="grid-2-print" style={{ marginBottom: 24 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.gold, letterSpacing: 1, marginBottom: 8 }}>PILIH TANGGAL</label>
                      <input type="date" value={printTanggal} onChange={e => setPrintTanggal(e.target.value)} className="inp"
                        style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, fontSize: 14, background: theme.inputBg, color: theme.text }} />
                      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                        <button onClick={() => setPrintTanggal(todayStr)} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${theme.cardBorder}`, background: printTanggal === todayStr ? theme.gold : "transparent", color: printTanggal === todayStr ? "#0f0f0f" : theme.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>HARI INI</button>
                        <button onClick={() => setPrintTanggal(toDateStr(yesterday))} style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${theme.cardBorder}`, background: printTanggal === toDateStr(yesterday) ? theme.gold : "transparent", color: printTanggal === toDateStr(yesterday) ? "#0f0f0f" : theme.textMuted, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>KEMARIN</button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: theme.gold, letterSpacing: 1, marginBottom: 8 }}>PILIH LANTAI</label>
                      <select value={printLantai} onChange={e => setPrintLantai(e.target.value)} className="inp"
                        style={{ width: "100%", padding: "12px 14px", border: `1.5px solid ${theme.inputBorder}`, borderRadius: 10, fontSize: 14, background: theme.inputBg, color: theme.text }}>
                        <option value="all">SEMUA LANTAI</option>
                        {FLOORS.map(l => <option key={l} value={l}>LANTAI {l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ background: printCount > 0 ? theme.successBg : "rgba(245, 158, 11, 0.1)", border: `1.5px solid ${printCount > 0 ? "rgba(22, 163, 74, 0.3)" : "rgba(245, 158, 11, 0.3)"}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 24 }}>{printCount > 0 ? "📋" : "📭"}</span>
                    <div>
                      <div style={{ fontWeight: 800, color: printCount > 0 ? "#4ade80" : "#fbbf24", fontSize: 15, letterSpacing: "0.5px" }}>{printCount > 0 ? `${printCount} KAMAR DITEMUKAN` : "TIDAK ADA DATA"}</div>
                      <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{fmtTanggal(printTanggal).toUpperCase()} · {printLantai === "all" ? "SEMUA LANTAI" : "LANTAI " + printLantai}</div>
                    </div>
                  </div>
                  <button onClick={() => setShowPrint(true)} disabled={printCount === 0}
                    style={{ width: "100%", padding: "16px", background: printCount === 0 ? "#475569" : theme.gold, color: printCount === 0 ? "#94a3b8" : "#0f0f0f", border: "none", borderRadius: 10, fontWeight: 800, fontSize: 15, cursor: printCount === 0 ? "not-allowed" : "pointer", letterSpacing: "1px", boxShadow: printCount > 0 ? `0 4px 14px ${theme.gold}44` : "none" }}>
                    PREVIEW & PRINT
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}