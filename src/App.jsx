import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection, onSnapshot, deleteDoc,
  doc, setDoc, query
} from "firebase/firestore";

const FLOORS = Array.from({length:17}, (_,i) => i+1);
const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
const today = new Date();
const yesterday = new Date(Date.now() - 86400000);
const toDateStr = d => d.toISOString().split("T")[0];
const todayStr = toDateStr(today);

// ID dokumen = tanggal_lantai_kamar → unik per kamar per hari
const makeDocId = (tanggal, lantai, kamar) => `${tanggal}_lt${lantai}_${kamar.replace(/\s/g,"")}`;

const EMPTY = {
  lantai:"", kamar:"",
  doorBefore:"", doorAfter:"", expiredBulan:"", expiredTahun:"", catatanDoor:"",
  channelInput:"", channelRusak:[],
  catatan:""
};

function selisihWaktu(before, after) {
  if (!before || !after) return null;
  const toSec = t => { const [h,m,s] = t.split(":").map(Number); return h*3600+m*60+(s||0); };
  const diff = Math.abs(toSec(after) - toSec(before));
  if (diff === 0) return null;
  const j = Math.floor(diff/3600), m = Math.floor((diff%3600)/60), s = diff%60;
  if (j > 0) return `${j} jam ${m} menit ${s} detik`;
  if (m > 0) return `${m} menit ${s} detik`;
  return `${s} detik`;
}

function fmt(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("id-ID", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
}

function fmtTanggal(dateStr) {
  return new Date(dateStr+"T00:00:00").toLocaleDateString("id-ID", { weekday:"long", day:"2-digit", month:"long", year:"numeric" });
}

function fmtExpired(bulan, tahun) {
  if (!bulan && !tahun) return "—";
  return `${MONTHS[Number(bulan)-1]||""} ${tahun}`.trim();
}

function Badge({ text, color }) {
  return <span style={{ background:color+"22", color, border:`1px solid ${color}44`, borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{text}</span>;
}

function Toast({ msg, ok, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return ()=>clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", top:20, left:"50%", transform:"translateX(-50%)", zIndex:99999, background:ok?"#16a34a":"#dc2626", color:"#fff", padding:"10px 24px", borderRadius:9, fontSize:13, fontWeight:600, boxShadow:"0 6px 20px rgba(0,0,0,0.2)", whiteSpace:"nowrap" }}>
      {msg}
    </div>
  );
}

function PrintView({ data, tanggal, lantai, onClose }) {
  const [savingPdf, setSavingPdf] = useState(false);

  const filtered = data
    .filter(d => d.tanggal === tanggal && (lantai==="all" || d.lantai===Number(lantai)))
    .sort((a,b) => a.lantai-b.lantai || a.kamar.localeCompare(b.kamar));

  const grouped = {};
  filtered.forEach(d => { if (!grouped[d.lantai]) grouped[d.lantai]=[]; grouped[d.lantai].push(d); });

  const handleSavePdf = async () => {
    setSavingPdf(true);
    try {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      document.head.appendChild(script);
      await new Promise(r => { script.onload = r; });
      const filename = `laporan-${tanggal}${lantai!=="all"?"-lt"+lantai:"-semua"}.pdf`;
      await window.html2pdf().set({
        margin:[8,8,8,8], filename,
        image:{ type:"jpeg", quality:0.98 },
        html2canvas:{ scale:2, useCORS:true, logging:false },
        jsPDF:{ unit:"mm", format:"a4", orientation:"portrait" }
      }).from(document.getElementById("print-area")).save();
    } catch { alert("Gagal simpan PDF, gunakan tombol Print → Save as PDF."); }
    setSavingPdf(false);
  };

  const th = () => ({ border:"1px solid #ccc", padding:"6px 8px", background:"#dce6f1", fontSize:10, fontWeight:700, color:"#1e3a5f", textAlign:"left" });
  const td = (x={}) => ({ border:"1px solid #ddd", padding:"5px 8px", fontSize:10, verticalAlign:"top", lineHeight:1.5, ...x });

  return (
    <>
      <style>{`
        @media print {
          body > * { display:none !important; }
          #print-modal { display:block !important; position:static !important; background:none !important; padding:0 !important; }
          #no-print { display:none !important; }
          #print-area { box-shadow:none !important; padding:10mm 12mm !important; max-width:100% !important; }
        }
        @page { size:A4 portrait; margin:0; }
      `}</style>
      <div id="print-modal" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:9000, overflowY:"auto", padding:"20px 16px" }}>
        <div id="no-print" style={{ maxWidth:760, margin:"0 auto 10px", display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ color:"#94a3b8", fontSize:12, marginRight:"auto" }}>Preview A4 · {filtered.length} kamar</span>
          <button onClick={onClose} style={{ padding:"7px 16px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Tutup</button>
          <button onClick={()=>window.print()} style={{ padding:"7px 16px", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, color:"#fff", fontWeight:600, fontSize:12, cursor:"pointer" }}>Print</button>
          <button onClick={handleSavePdf} disabled={savingPdf} style={{ padding:"7px 18px", background:savingPdf?"#475569":"#2563eb", border:"none", borderRadius:8, color:"#fff", fontWeight:700, fontSize:12, cursor:savingPdf?"not-allowed":"pointer" }}>
            {savingPdf?"Menyimpan...":"Simpan PDF"}
          </button>
        </div>
        <div id="print-area" style={{ maxWidth:760, margin:"0 auto", background:"#fff", padding:"14px 18px", boxShadow:"0 8px 40px rgba(0,0,0,0.35)", fontFamily:"Arial,sans-serif" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", borderBottom:"2px solid #1e3a5f", paddingBottom:6, marginBottom:8 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:900, color:"#1e3a5f" }}>LAPORAN PENGECEKAN KAMAR HOTEL</div>
              <div style={{ fontSize:7.5, color:"#555", marginTop:2 }}>
                Tanggal: <b>{fmtTanggal(tanggal)}</b>&emsp;Lantai: <b>{lantai==="all"?"Semua":"Lantai "+lantai}</b>&emsp;Total: <b>{filtered.length} kamar</b>
              </div>
            </div>
            <div style={{ fontSize:7, color:"#999" }}>Dicetak: {new Date().toLocaleString("id-ID")}</div>
          </div>
          {filtered.length===0 ? (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#aaa", fontSize:11 }}>Tidak ada data untuk filter ini</div>
          ) : Object.keys(grouped).sort((a,b)=>Number(a)-Number(b)).map(lt => (
            <div key={lt} style={{ marginBottom:10 }}>
              <div style={{ background:"#1e3a5f", color:"#fff", padding:"2px 7px", fontSize:8, fontWeight:800, display:"flex", justifyContent:"space-between" }}>
                <span>LANTAI {lt}</span><span>{grouped[lt].length} kamar</span>
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr><th style={th()}>Kamar</th><th style={th()}>Before</th><th style={th()}>After</th><th style={th()}>Durasi</th><th style={th()}>Exp. Baterai</th><th style={th()}>Channel Rusak</th><th style={th()}>Catatan Door</th><th style={th()}>Catatan Umum</th></tr>
                </thead>
                <tbody>
                  {grouped[lt].map((row,i) => (
                    <tr key={row.id} style={{ background:i%2===0?"#fff":"#f5f8fc" }}>
                      <td style={td({ fontWeight:700, color:"#1e3a5f" })}>{row.kamar}</td>
                      <td style={td({ fontFamily:"monospace", whiteSpace:"nowrap" })}>{row.doorBefore||"—"}</td>
                      <td style={td({ fontFamily:"monospace", whiteSpace:"nowrap" })}>{row.doorAfter||"—"}</td>
                      <td style={td({ color:"#16a34a", fontWeight:600 })}>{selisihWaktu(row.doorBefore,row.doorAfter)||"—"}</td>
                      <td style={td()}>{fmtExpired(row.expiredBulan, row.expiredTahun)}</td>
                      <td style={td({ color:row.channelRusak?.length?"#dc2626":"#bbb", wordBreak:"break-word" })}>{row.channelRusak?.join(", ")||"—"}</td>
                      <td style={td({ color:"#444", wordBreak:"break-word" })}>{row.catatanDoor||"—"}</td>
                      <td style={td({ color:"#444", wordBreak:"break-word" })}>{row.catatan||"—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
          <div style={{ borderTop:"1px solid #ddd", marginTop:10, paddingTop:5, display:"flex", justifyContent:"space-between", fontSize:7, color:"#aaa" }}>
            <span>Hotel Room Check System</span><span>{new Date().toLocaleString("id-ID")}</span>
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
  const [showPrint, setShowPrint] = useState(false);
  const [printTanggal, setPrintTanggal] = useState(todayStr);
  const [printLantai, setPrintLantai] = useState("all");
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const showToast = (msg, ok=true) => setToast({ msg, ok });

  useEffect(() => {
    const q = query(collection(db, "pengecekan"));
    const unsub = onSnapshot(q, snap => {
      setData(snap.docs.map(d => ({ id:d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const addChannel = () => {
    if (!form.channelInput.trim()) return;
    setForm(f => ({ ...f, channelRusak:[...f.channelRusak, f.channelInput.trim()], channelInput:"" }));
  };
  const removeChannel = i => setForm(f => ({ ...f, channelRusak:f.channelRusak.filter((_,idx)=>idx!==i) }));

  const handleSubmit = async () => {
    if (!form.lantai || !form.kamar.trim()) { showToast("Lantai dan nomor kamar wajib diisi!", false); return; }
    setSaving(true);
    try {
      const tanggal = todayStr;
      const docId = editId || makeDocId(tanggal, form.lantai, form.kamar);

      // Ambil data lama kalau sudah ada (merge — hanya timpa field yang diisi)
      const existing = data.find(d => d.id === docId);
      const payload = {
        tanggal,
        lantai: Number(form.lantai),
        kamar: form.kamar.trim(),
        // Timpa hanya kalau field diisi, kalau kosong pakai data lama
        doorBefore:   form.doorBefore   || existing?.doorBefore   || "",
        doorAfter:    form.doorAfter    || existing?.doorAfter    || "",
        expiredBulan: form.expiredBulan || existing?.expiredBulan || "",
        expiredTahun: form.expiredTahun || existing?.expiredTahun || "",
        catatanDoor:  form.catatanDoor  || existing?.catatanDoor  || "",
        channelRusak: form.channelRusak.length ? form.channelRusak : (existing?.channelRusak || []),
        catatan:      form.catatan      || existing?.catatan      || "",
        updatedAt:    new Date().toISOString(),
      };
      if (!existing) payload.createdAt = new Date().toISOString();

      await setDoc(doc(db, "pengecekan", docId), payload, { merge:true });
      showToast(existing ? `Data kamar ${form.kamar} diperbarui ✓` : `Data kamar ${form.kamar} disimpan ✓`);
      setForm(EMPTY);
      setEditId(null);
    } catch(e) { showToast("Gagal menyimpan: "+e.message, false); }
    setSaving(false);
  };

  const handleEdit = row => {
    setForm({ ...EMPTY, lantai:String(row.lantai), kamar:row.kamar, doorBefore:row.doorBefore||"", doorAfter:row.doorAfter||"", expiredBulan:row.expiredBulan||"", expiredTahun:row.expiredTahun||"", catatanDoor:row.catatanDoor||"", channelRusak:row.channelRusak||[], catatan:row.catatan||"" });
    setEditId(row.id);
    setTab("form");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const handleDelete = async id => {
    try {
      if (id === "__all__") {
        const { getDocs } = await import("firebase/firestore");
        const snap = await getDocs(collection(db, "pengecekan"));
        await Promise.all(snap.docs.map(d => deleteDoc(doc(db, "pengecekan", d.id))));
        showToast("Semua data berhasil dihapus");
      } else {
        await deleteDoc(doc(db, "pengecekan", id));
        showToast("Data dihapus");
      }
    } catch(e) { showToast("Gagal hapus: "+e.message, false); }
    setConfirmDelete(null);
  };

  const grouped = {};
  const filtered = filterLantai==="all" ? data : data.filter(d=>d.lantai===Number(filterLantai));
  filtered.forEach(d => { if(!grouped[d.lantai]) grouped[d.lantai]=[]; grouped[d.lantai].push(d); });

  const printCount = data.filter(d => d.tanggal===printTanggal && (printLantai==="all"||d.lantai===Number(printLantai))).length;

  const yearOptions = Array.from({length:10}, (_,i) => 2025+i);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{background:#f0f4f8;font-family:'Plus Jakarta Sans',sans-serif;}
        input,select,textarea{font-family:'Plus Jakarta Sans',sans-serif;}
        input:focus,select:focus,textarea:focus{outline:none;}
        .inp:focus{border-color:#2563eb !important;box-shadow:0 0 0 3px rgba(37,99,235,0.12) !important;}
        .row-hover:hover{background:#f0f6ff !important;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:4px;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        .fade-up{animation:fadeUp 0.35s ease both;}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .grid-2-print{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
        @media(max-width:600px){
          .grid-2{grid-template-columns:1fr !important;}
          .grid-2-print{grid-template-columns:1fr !important;}
          .tab-label{display:none;}
          .card-pad{padding:16px !important;}
          .header-sub{display:none;}
          .filter-scroll{overflow-x:auto;padding-bottom:4px;flex-wrap:nowrap !important;}
          .filter-scroll button{flex-shrink:0;}
          .row-actions{flex-direction:column !important;}
          .row-actions button{width:100% !important;text-align:center;}
        }
      `}</style>

      {toast && <Toast msg={toast.msg} ok={toast.ok} onDone={()=>setToast(null)}/>}
      {showPrint && <PrintView data={data} tanggal={printTanggal} lantai={printLantai} onClose={()=>setShowPrint(false)}/>}

      {confirmDelete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:8000, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:"#fff", borderRadius:16, padding:"28px 32px", maxWidth:320, textAlign:"center", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize:32, marginBottom:10 }}></div>
            <div style={{ fontSize:17, fontWeight:800, color:"#1e293b", marginBottom:8 }}>{confirmDelete==="__all__"?"Hapus semua data?":"Hapus data ini?"}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginBottom:22 }}>Tindakan ini tidak bisa dikembalikan</div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={()=>setConfirmDelete(null)} style={{ padding:"9px 20px", borderRadius:8, border:"1.5px solid #e2e8f0", background:"#fff", color:"#64748b", cursor:"pointer", fontWeight:600, fontSize:13 }}>Batal</button>
              <button onClick={()=>handleDelete(confirmDelete)} style={{ padding:"9px 20px", borderRadius:8, border:"none", background:"#dc2626", color:"#fff", cursor:"pointer", fontWeight:700, fontSize:13 }}>Hapus</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ minHeight:"100vh", background:"#f0f4f8" }}>
        <div style={{ background:"#1e3a5f", padding:"0 24px", display:"flex", alignItems:"center", gap:16, height:60, boxShadow:"0 2px 12px rgba(0,0,0,0.15)", position:"sticky", top:0, zIndex:100 }}>
          {/* <div style={{ width:36,height:36,borderRadius:10,background:"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18 }}></div> */}
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:"#fff" }}>Hotel Room Check</div>
            <div style={{ fontSize:8, color:"#7ca3cc", fontFamily:"'DM Mono',monospace", letterSpacing:1 }}>SISTEM PENGECEKAN KAMAR</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", gap:4 }}>
            {[["form","📋","Input"],["data","🗄️","Database"],["print","🖨️","Print"]].map(([t,icon,label]) => (
              <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 14px", borderRadius:8, border:"none", background:tab===t?"#2563eb":"transparent", color:tab===t?"#fff":"#7ca3cc", fontWeight:700, fontSize:13, cursor:"pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:5 }}>
                <span>{icon}</span><span className="tab-label">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ maxWidth:900, margin:"0 auto", padding:"20px 12px" }}>

          {/* FORM */}
          {tab==="form" && (
            <div className="fade-up">
              <div style={{ background:"#fff", borderRadius:18, boxShadow:"0 2px 20px rgba(0,0,0,0.07)", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)", padding:"18px 20px" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{editId?"Edit Data Kamar":"Form Pengecekan Kamar"}</div>
                  <div style={{ fontSize:12, color:"#93c5fd", marginTop:4 }}>
                    {editId ? "Ubah data lalu klik Perbarui" : `Data hari ini (${fmtTanggal(todayStr)}) — kamar yang sama akan digabung otomatis`}
                  </div>
                </div>
                <div className="card-pad" style={{ padding:"28px 28px 32px" }}>

                  {/* Lantai & Kamar */}
                  <div className="grid-2" style={{ marginBottom:20 }}>
                    <div>
                      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:7 }}>LANTAI</label>
                      <select value={form.lantai} onChange={e=>setForm(f=>({...f,lantai:e.target.value}))} className="inp"
                        style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, color:form.lantai?"#1e293b":"#94a3b8", background:"#f8fafc" }}>
                        <option value="">Pilih lantai...</option>
                        {FLOORS.map(l=><option key={l} value={l}>Lantai {l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:7 }}>NOMOR KAMAR</label>
                      <input type="text" value={form.kamar} onChange={e=>setForm(f=>({...f,kamar:e.target.value}))} placeholder="Contoh: 301" className="inp" style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#f8fafc", color:"#1e293b" }}/>
                    </div>
                  </div>

                  {/* Info gabung */}
                  {form.lantai && form.kamar && (() => {
                    const existing = data.find(d => d.id === makeDocId(todayStr, form.lantai, form.kamar));
                    if (!existing) return null;
                    return (
                      <div style={{ background:"#fffbeb", border:"1.5px solid #fcd34d", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:12, color:"#92400e", display:"flex", alignItems:"center", gap:8 }}>
                        <span>⚠️</span>
                        <span>Kamar <b>{form.kamar}</b> hari ini sudah ada data. Input kamu akan <b>digabungkan</b> dengan data yang ada.</span>
                      </div>
                    );
                  })()}

                  {/* Door Lock */}
                  <div style={{ background:"#f1f5f9", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1e3a5f", marginBottom:14 }}>Door Lock <span style={{ fontSize:11, fontWeight:400, color:"#94a3b8" }}>(boleh dikosongkan)</span></div>
                    <div className="grid-2" style={{ marginBottom:12 }}>
                      <div>
                        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:6 }}>WAKTU BEFORE</label>
                        <input type="time" step="1" value={form.doorBefore} onChange={e=>setForm(f=>({...f,doorBefore:e.target.value}))} className="inp"
                          style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:14, background:"#fff", color:"#1e293b" }}/>
                      </div>
                      <div>
                        <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:6 }}>WAKTU AFTER</label>
                        <input type="time" step="1" value={form.doorAfter} onChange={e=>setForm(f=>({...f,doorAfter:e.target.value}))} className="inp"
                          style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:14, background:"#fff", color:"#1e293b" }}/>
                      </div>
                    </div>
                    {/* Expired baterai — bulan & tahun */}
                    <div style={{ marginBottom:12 }}>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:6 }}>EXPIRED BATERAI</label>
                      <div className="grid-2" style={{ gap:10 }}>
                        <select value={form.expiredBulan} onChange={e=>setForm(f=>({...f,expiredBulan:e.target.value}))} className="inp"
                          style={{ padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:14, background:"#fff", color:form.expiredBulan?"#1e293b":"#94a3b8" }}>
                          <option value="">Bulan...</option>
                          {MONTHS.map((m,i)=><option key={i+1} value={String(i+1).padStart(2,"0")}>{m}</option>)}
                        </select>
                        <select value={form.expiredTahun} onChange={e=>setForm(f=>({...f,expiredTahun:e.target.value}))} className="inp"
                          style={{ padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:14, background:"#fff", color:form.expiredTahun?"#1e293b":"#94a3b8" }}>
                          <option value="">Tahun...</option>
                          {yearOptions.map(y=><option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:6 }}>CATATAN DOOR LOCK</label>
                      <input type="text" value={form.catatanDoor} onChange={e=>setForm(f=>({...f,catatanDoor:e.target.value}))} placeholder="Misal: Battery lowbat, sudah diganti" className="inp"
                        style={{ width:"100%", padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:14, background:"#fff", color:"#1e293b" }}/>
                    </div>
                  </div>

                  {/* Channel TV */}
                  <div style={{ background:"#f1f5f9", borderRadius:12, padding:"18px 20px", marginBottom:20 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#1e3a5f", marginBottom:14 }}>Channel TV Rusak <span style={{ fontSize:11, fontWeight:400, color:"#94a3b8" }}>(boleh dikosongkan)</span></div>
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <input type="text" value={form.channelInput} onChange={e=>setForm(f=>({...f,channelInput:e.target.value}))}
                        onKeyDown={e=>e.key==="Enter"&&addChannel()} placeholder="Ketik nama channel, tekan Enter..." className="inp"
                        style={{ flex:1, padding:"10px 12px", border:"1.5px solid #e2e8f0", borderRadius:9, fontSize:14, background:"#fff", color:"#1e293b" }}/>
                      <button onClick={addChannel} style={{ padding:"10px 18px", background:"#2563eb", color:"#fff", border:"none", borderRadius:9, fontWeight:700, fontSize:13, cursor:"pointer" }}>+ Tambah</button>
                    </div>
                    {form.channelRusak.length > 0 ? (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                        {form.channelRusak.map((ch,i)=>(
                          <span key={i} style={{ background:"#fee2e2", color:"#dc2626", border:"1px solid #fca5a5", borderRadius:7, padding:"4px 10px", fontSize:12, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
                            {ch} <span onClick={()=>removeChannel(i)} style={{ cursor:"pointer", opacity:0.7 }}>✕</span>
                          </span>
                        ))}
                      </div>
                    ) : <div style={{ fontSize:12, color:"#94a3b8", fontStyle:"italic" }}>Belum ada channel ditambahkan</div>}
                  </div>

                  {/* Catatan */}
                  <div style={{ marginBottom:24 }}>
                    <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:7 }}>CATATAN UMUM <span style={{ fontSize:11, fontWeight:400, color:"#94a3b8" }}>(boleh dikosongkan)</span></label>
                    <textarea value={form.catatan} onChange={e=>setForm(f=>({...f,catatan:e.target.value}))} placeholder="Catatan tambahan lainnya..." className="inp" rows={3}
                      style={{ width:"100%", padding:"11px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#f8fafc", color:"#1e293b", resize:"vertical" }}/>
                  </div>

                  <div style={{ display:"flex", gap:10 }}>
                    {editId && (
                      <button onClick={()=>{setEditId(null);setForm(EMPTY);}} style={{ padding:"14px 20px", background:"#f1f5f9", color:"#64748b", border:"none", borderRadius:12, fontWeight:700, fontSize:14, cursor:"pointer" }}>Batal</button>
                    )}
                    <button onClick={handleSubmit} disabled={saving}
                      style={{ flex:1, padding:"14px", background:saving?"#475569":"#2563eb", color:"#fff", border:"none", borderRadius:12, fontWeight:800, fontSize:15, cursor:saving?"not-allowed":"pointer", boxShadow:"0 4px 14px rgba(37,99,235,0.35)", opacity:saving?0.8:1 }}>
                      {saving?"Menyimpan...":editId?"Perbarui Data":"Simpan ke Database"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DATABASE */}
          {tab==="data" && (
            <div className="fade-up">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, gap:10, flexWrap:"wrap" }}>
                <div className="filter-scroll" style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#64748b" }}>Filter Lantai:</span>
                {["all",...FLOORS.map(String)].filter(l=>l==="all"||data.some(d=>d.lantai===Number(l))).map(l=>(
                  <button key={l} onClick={()=>setFilterLantai(l)} style={{ padding:"6px 14px", borderRadius:8, border:"none", background:filterLantai===l?"#2563eb":"#fff", color:filterLantai===l?"#fff":"#64748b", fontWeight:600, fontSize:12, cursor:"pointer", boxShadow:"0 1px 4px rgba(0,0,0,0.08)" }}>
                    {l==="all"?"Semua":"Lt. "+l}
                  </button>
                ))}
                </div>
                <button onClick={()=>setConfirmDelete("__all__")} style={{ padding:"7px 16px", background:"#fff1f2", color:"#e11d48", border:"1px solid #fecdd3", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer", flexShrink:0 }}>Hapus Semua</button>
              </div>
              {loading ? (
                <div style={{ textAlign:"center", padding:60, color:"#94a3b8", fontSize:14 }}>Memuat data dari Firebase...</div>
              ) : filtered.length===0 ? (
                <div style={{ textAlign:"center", padding:"60px 0", color:"#94a3b8" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}></div>
                  <div style={{ fontSize:16, fontWeight:700 }}>Belum ada data</div>
                </div>
              ) : Object.keys(grouped).sort((a,b)=>Number(a)-Number(b)).map(lantai=>(
                <div key={lantai} style={{ marginBottom:24 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                    <div style={{ background:"#1e3a5f", color:"#fff", borderRadius:8, padding:"4px 14px", fontSize:13, fontWeight:800 }}>Lantai {lantai}</div>
                    <div style={{ flex:1, height:1, background:"#e2e8f0" }}></div>
                    <span style={{ fontSize:12, color:"#94a3b8", fontFamily:"'DM Mono',monospace" }}>{grouped[lantai].length} kamar</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {grouped[lantai].sort((a,b)=>a.kamar.localeCompare(b.kamar)).map(row=>(
                      <div key={row.id} className="row-hover" style={{ background:"#fff", borderRadius:14, padding:"16px 20px", boxShadow:"0 1px 8px rgba(0,0,0,0.06)", transition:"background 0.15s", border:"1px solid #f1f5f9" }}>
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12 }}>
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                              <span style={{ fontWeight:800, fontSize:16, color:"#1e293b" }}>Kamar {row.kamar}</span>
                              <span style={{ fontSize:10, color:"#94a3b8", fontFamily:"'DM Mono',monospace", background:"#f1f5f9", borderRadius:5, padding:"2px 7px" }}>{row.tanggal}</span>
                              {row.catatanDoor?.toLowerCase().includes("lowbat") && <Badge text="Battery Lowbat" color="#f59e0b"/>}
                              {row.channelRusak?.length>0 && <Badge text={`${row.channelRusak.length} ch rusak`} color="#dc2626"/>}
                            </div>
                            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px 18px", marginBottom:6 }}>
                              {row.doorBefore && <span style={{ fontSize:12, color:"#64748b" }}>Before: <strong style={{color:"#1e293b"}}>{row.doorBefore}</strong></span>}
                              {row.doorAfter  && <span style={{ fontSize:12, color:"#64748b" }}>After: <strong style={{color:"#1e293b"}}>{row.doorAfter}</strong></span>}
                              {(row.expiredBulan||row.expiredTahun) && <span style={{ fontSize:12, color:"#64748b" }}>Expired: <strong style={{color:"#1e293b"}}>{fmtExpired(row.expiredBulan,row.expiredTahun)}</strong></span>}
                            </div>
                            {selisihWaktu(row.doorBefore,row.doorAfter) && (
                              <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#f0fdf4", border:"1px solid #86efac", borderRadius:7, padding:"3px 10px", fontSize:12, color:"#16a34a", fontWeight:600, marginBottom:6, fontFamily:"'DM Mono',monospace" }}>
                                Durasi: {selisihWaktu(row.doorBefore,row.doorAfter)}
                              </div>
                            )}
                            {row.channelRusak?.length>0 && (
                              <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:6 }}>
                                {row.channelRusak.map((ch,i)=><Badge key={i} text={ch} color="#64748b"/>)}
                              </div>
                            )}
                            {(row.catatanDoor||row.catatan) && (
                              <div style={{ fontSize:12, color:"#64748b", fontStyle:"italic" }}>
                                {row.catatanDoor&&<span>{row.catatanDoor} </span>}
                                {row.catatan&&<span>{row.catatan}</span>}
                              </div>
                            )}
                          </div>
                          <div className="row-actions" style={{ display:"flex", gap:6, flexShrink:0 }}>
                            <button onClick={()=>handleEdit(row)} style={{ padding:"7px 14px", background:"#eff6ff", color:"#2563eb", border:"1px solid #bfdbfe", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>Edit</button>
                            <button onClick={()=>setConfirmDelete(row.id)} style={{ padding:"7px 14px", background:"#fff1f2", color:"#e11d48", border:"1px solid #fecdd3", borderRadius:8, fontSize:12, fontWeight:700, cursor:"pointer" }}>Hapus</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRINT */}
          {tab==="print" && (
            <div className="fade-up">
              <div style={{ background:"#fff", borderRadius:18, boxShadow:"0 2px 20px rgba(0,0,0,0.07)", overflow:"hidden" }}>
                <div style={{ background:"linear-gradient(135deg,#1e3a5f,#2563eb)", padding:"18px 20px" }}>
                  <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>Print Laporan</div>
                  <div style={{ fontSize:12, color:"#93c5fd", marginTop:4 }}>Pilih tanggal dan lantai, lalu cetak ke kertas A4</div>
                </div>
                <div style={{ padding:"28px" }}>
                  <div className="grid-2-print" style={{ marginBottom:24 }}>
                    <div>
                      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:8 }}>PILIH TANGGAL</label>
                      <input type="date" value={printTanggal} onChange={e=>setPrintTanggal(e.target.value)} className="inp"
                        style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#f8fafc", color:"#1e293b" }}/>
                      <div style={{ marginTop:8, display:"flex", gap:8 }}>
                        <button onClick={()=>setPrintTanggal(todayStr)} style={{ padding:"5px 12px", borderRadius:7, border:"1.5px solid #e2e8f0", background:printTanggal===todayStr?"#2563eb":"#f8fafc", color:printTanggal===todayStr?"#fff":"#64748b", fontSize:11, fontWeight:700, cursor:"pointer" }}>Hari Ini</button>
                        <button onClick={()=>setPrintTanggal(toDateStr(yesterday))} style={{ padding:"5px 12px", borderRadius:7, border:"1.5px solid #e2e8f0", background:printTanggal===toDateStr(yesterday)?"#2563eb":"#f8fafc", color:printTanggal===toDateStr(yesterday)?"#fff":"#64748b", fontSize:11, fontWeight:700, cursor:"pointer" }}>Kemarin</button>
                      </div>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:12, fontWeight:700, color:"#64748b", letterSpacing:0.5, marginBottom:8 }}>PILIH LANTAI</label>
                      <select value={printLantai} onChange={e=>setPrintLantai(e.target.value)} className="inp"
                        style={{ width:"100%", padding:"12px 14px", border:"1.5px solid #e2e8f0", borderRadius:10, fontSize:14, background:"#f8fafc", color:"#1e293b" }}>
                        <option value="all">Semua Lantai</option>
                        {FLOORS.map(l=><option key={l} value={l}>Lantai {l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ background:printCount>0?"#f0fdf4":"#fff7ed", border:`1.5px solid ${printCount>0?"#86efac":"#fed7aa"}`, borderRadius:10, padding:"14px 18px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
                    <span style={{ fontSize:22 }}>{printCount>0?"📋":""}</span>
                    <div>
                      <div style={{ fontWeight:700, color:printCount>0?"#16a34a":"#ea580c", fontSize:14 }}>{printCount>0?`${printCount} kamar ditemukan`:"Tidak ada data"}</div>
                      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}>{fmtTanggal(printTanggal)} · {printLantai==="all"?"Semua lantai":"Lantai "+printLantai}</div>
                    </div>
                  </div>
                  <button onClick={()=>setShowPrint(true)} disabled={printCount===0}
                    style={{ width:"100%", padding:"14px", background:printCount===0?"#94a3b8":"#1e3a5f", color:"#fff", border:"none", borderRadius:12, fontWeight:800, fontSize:15, cursor:printCount===0?"not-allowed":"pointer" }}>
                    Preview & Print
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