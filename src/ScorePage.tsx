import React,{useEffect,useMemo,useState} from 'react'

type Props={matchId:string;refreshSeconds:number}
const ordinal=(n:number)=>n===1?'1st':n===2?'2nd':n===3?'3rd':n+'th'
const cleanText=(value:any)=>String(value??'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'")
const num=(v:any)=>Number.isFinite(Number(v))?Number(v):0
export default function ScorePage({matchId,refreshSeconds}:Props){
 const [data,setData]=useState<any>(null),[busy,setBusy]=useState(true),[error,setError]=useState(''),[lastUpdated,setLastUpdated]=useState(''),[selected,setSelected]=useState(0),[manualRefresh,setManualRefresh]=useState(0)
 useEffect(()=>{
  let stopped=false,timeout:number|undefined
  const delay=Math.min(300,Math.max(15,Number(refreshSeconds)||30))*1000
  const load=async()=>{
   try{
    const response=await fetch('/api/score?matchId='+encodeURIComponent(matchId||'161285')+'&refresh='+Math.round(delay/1000))
    if(!response.ok)throw new Error('Score service returned '+response.status)
    const result=await response.json()
    if(!result?.data?.match_header)throw new Error('The score API response is missing match details.')
    if(stopped)return
    setData(result.data);setLastUpdated(result.fetchedAt||new Date().toISOString());setError('');setBusy(false)
    const complete=result.data.match_header.complete===true||String(result.data.match_header.state||'').toLowerCase()==='complete'
    if(!complete)timeout=window.setTimeout(load,delay)
   }catch(e){
    if(stopped)return
    setError(e instanceof Error?e.message:'Unable to load the score right now.');setBusy(false)
    timeout=window.setTimeout(load,delay)
   }
  }
  load()
  return()=>{stopped=true;if(timeout)window.clearTimeout(timeout)}
 },[matchId,refreshSeconds,manualRefresh])
 const header=data?.match_header||{},live=data?.live_score||{},innings=Array.isArray(data?.scorecard)?data.scorecard:[],commentary=useMemo(()=>Object.values(data?.commentary||{}).filter((x:any)=>x?.commType==='commentary'&&x?.commText).sort((a:any,b:any)=>num(b.timestamp)-num(a.timestamp)),[data])
 const current=innings[selected]||innings[innings.length-1]
 const batters=Object.values(current?.batTeamDetails?.batsmenData||{}).sort((a:any,b:any)=>num(a.batId)-num(b.batId))
 const bowlers=Object.values(current?.bowlTeamDetails?.bowlersData||{}).sort((a:any,b:any)=>num(a.bowlerId)-num(b.bowlerId))
 const team1=header.team1?.name||header.team1?.shortName||'Team 1',team2=header.team2?.name||header.team2?.shortName||'Team 2'
 const complete=header.complete===true||String(header.state||'').toLowerCase()==='complete'
 const inningsLabel=(inn:any,index:number)=>ordinal(index+1)+' innings · '+(inn?.batTeamDetails?.batTeamName||'')
 const refresh=()=>setManualRefresh(x=>x+1)
 return <div className="score-page">
  <div className="score-page-heading"><div><span className="eyebrow">BOUNDARYLIVE · MATCH CENTRE</span><h1>{team1} vs {team2}</h1><p>{header.seriesDesc||header.seriesName||'Cricket match'}{header.venue?.name?' · '+header.venue.name:''}{header.venue?.city?', '+header.venue.city:''}</p></div><button className="secondary score-refresh" onClick={refresh} disabled={busy}>↻ Refresh</button></div>
  {error&&<div className="score-error" role="status">{data?'Showing the last available score. ':''}{error}</div>}
  {!data&&busy?<div className="score-loading">Loading match score…</div>:!data?<div className="score-empty">Score data is not available yet. Please try again shortly.</div>:<>
   <section className="score-result-card">
    <div className="score-status-row"><span className={'score-state '+(complete?'complete':'live')}>{complete?'COMPLETED':'LIVE SCORE'}</span><span className="score-format">{header.matchDescription||header.matchFormat||'Cricket'} · {header.matchType||'Match'}</span></div>
    <h2>{header.status||live.status||'Match in progress'}</h2>
    <div className="score-team-pair"><div><span>{team1}</span><strong>{innings.filter((x:any)=>x?.batTeamDetails?.batTeamName===team1).map((x:any)=>num(x.scoreDetails?.runs)+'/'+num(x.scoreDetails?.wickets)).join(' & ')||'—'}</strong></div><b>VS</b><div><span>{team2}</span><strong>{innings.filter((x:any)=>x?.batTeamDetails?.batTeamName===team2).map((x:any)=>num(x.scoreDetails?.runs)+'/'+num(x.scoreDetails?.wickets)).join(' & ')||'—'}</strong></div></div>
    <div className="score-summary-meta">{header.tossResults?.tossWinnerName?'Toss: '+header.tossResults.tossWinnerName+' elected to '+(header.tossResults.decision||'')+'.':''}{header.venue?.name?' · '+header.venue.name:''}{header.venue?.city?' · '+header.venue.city:''}</div>
    {header.playersOfTheMatch?.length>0&&<div className="score-player-award"><span>PLAYER OF THE MATCH</span><strong>{header.playersOfTheMatch.map((p:any)=>p.name).join(', ')}</strong></div>}
   </section>
   <section className="innings-overview"><div className="section-heading"><div><span className="eyebrow">MATCH SCORE</span><h2>Innings summary</h2></div></div><div className="innings-summary-grid">{innings.map((inn:any,index:number)=><button key={inn.inningsId||index} className={'innings-summary '+(selected===index?'active':'')} onClick={()=>setSelected(index)}><span>{inningsLabel(inn,index)}</span><strong>{num(inn.scoreDetails?.runs)}/{num(inn.scoreDetails?.wickets)}{inn.scoreDetails?.declared?' dec':''}</strong><small>{inn.scoreDetails?.overs??'—'} overs · RR {inn.scoreDetails?.runRate??'—'}</small></button>)}</div></section>
   {current&&<section className="scorecard-section">
    <div className="section-heading"><div><span className="eyebrow">FULL SCORECARD</span><h2>{inningsLabel(current,selected)}</h2></div></div>
    <div className="score-table-wrap"><table className="score-table"><thead><tr><th>Batter</th><th>Dismissal</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th></tr></thead><tbody>{batters.map((p:any)=><tr key={p.batId}><td><strong>{p.batName}</strong>{p.isCaptain?' (c)':''}{p.isKeeper?' (wk)':''}</td><td className="dismissal">{p.outDesc||'not out'}</td><td>{num(p.runs)}</td><td>{num(p.balls)}</td><td>{num(p.fours)}</td><td>{num(p.sixes)}</td><td>{p.strikeRate??'—'}</td></tr>)}</tbody></table></div>
    <div className="score-extras"><span>Extras</span><strong>{num(current.extrasData?.total)}</strong><small>(b {num(current.extrasData?.byes)}, lb {num(current.extrasData?.legByes)}, w {num(current.extrasData?.wides)}, nb {num(current.extrasData?.noBalls)}, p {num(current.extrasData?.penalty)})</small><b>Total: {num(current.scoreDetails?.runs)}/{num(current.scoreDetails?.wickets)} ({current.scoreDetails?.overs??'—'} ov){current.scoreDetails?.declared?' dec':''}</b></div>
    <div className="score-table-wrap bowling-table"><table className="score-table"><thead><tr><th>Bowler</th><th>O</th><th>M</th><th>R</th><th>W</th><th>ECON</th></tr></thead><tbody>{bowlers.map((p:any)=><tr key={p.bowlerId}><td><strong>{p.bowlName}</strong></td><td>{p.overs}</td><td>{p.maidens}</td><td>{p.runs}</td><td><strong>{p.wickets}</strong></td><td>{p.economy}</td></tr>)}</tbody></table></div>
   </section>}
   <section className="commentary-section"><div className="section-heading"><div><span className="eyebrow">BALL BY BALL</span><h2>Commentary</h2></div><span className="commentary-count">{commentary.length} updates</span></div>{commentary.length===0?<p className="score-empty">No commentary is available for this match.</p>:<div className="commentary-list">{commentary.slice(0,35).map((item:any,index:number)=><article className="commentary-item" key={item.timestamp||index}><div className="commentary-meta"><strong>{item.ballMetric!==undefined?'Over '+item.ballMetric:item.teamName||'Match update'}</strong><time>{item.timestamp?new Date(num(item.timestamp)).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):''}</time></div><p>{cleanText(item.commText)}</p></article>)}</div>}</section>
   <div className="score-updated">API response fetched: {lastUpdated?new Date(lastUpdated).toLocaleString():'—'} · Auto-refresh {complete?'stopped (match complete)':Math.max(15,Number(refreshSeconds)||30)+' seconds'}</div>
  </>}
 </div>
}
