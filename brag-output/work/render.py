from pathlib import Path
import sys, json, math, shutil, subprocess, wave
from functools import lru_cache
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HERE = Path(__file__).resolve().parent
OUT = HERE.parent
ROOT = OUT.parent
sys.path.insert(0, str(HERE / 'deps'))
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

W, H, FPS, DURATION = 1920, 1080, 30, 21
PAL = json.loads((ROOT / 'src/data/palette.json').read_text())
BG, INK, MIST, ORANGE = [PAL[k] for k in ['bg','text','text-secondary','flare']]
FFMPEG = ROOT / '.tools/video/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe'
ASSETS = HERE / 'assets'
ASSETS.mkdir(exist_ok=True)
FILES = {
 'hero':'hero-three/hero-spectral.webp',
 'dashboard':'projects/company-dashboard/2-focus.webp',
 'teams':'projects/company-dashboard/4-focus.webp',
 'workflow':'projects/leadsedge-voice-workflow/1-focus.webp',
 'phone1':'projects/gym-app/1-focus.webp',
 'phone2':'projects/gym-app/2-focus.webp',
 'phone3':'projects/gym-app/3-focus.webp',
}
for name, path in FILES.items():
    shutil.copy2(ROOT/'public'/path, ASSETS/f'{name}.webp')
font_source = ROOT/'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'
for weight in [450,650]:
    dest = ASSETS/f'Inter-{weight}.ttf'
    if not dest.exists():
        ft=TTFont(font_source); ft.flavor=None
        instantiateVariableFont(ft, {'wght':weight}, inplace=True).save(dest)
shutil.copy2(ROOT/'node_modules/@fontsource-variable/inter/LICENSE',ASSETS/'Inter-LICENSE.txt')
IMAGES={key:Image.open(ASSETS/f'{key}.webp').convert('RGBA') for key in FILES}

@lru_cache(None)
def font(size,weight=650): return ImageFont.truetype(str(ASSETS/f'Inter-{weight}.ttf'),size)
def ease(t):
    t=max(0,min(1,t)); return 1-(1-t)**3
def smooth(t):
    t=max(0,min(1,t)); return t*t*(3-2*t)
def txt(im,s,x,y,size=40,color=INK,weight=650):
    ImageDraw.Draw(im).text((int(x),int(y)),s,font=font(size,weight),fill=color,anchor='lt')
def line(im,a,b,color=MIST,width=1): ImageDraw.Draw(im).line([a,b],fill=color,width=width)

# Subtle atmosphere uses the same palette as the website.
yy,xx=np.mgrid[0:H,0:W]
base=np.zeros((H,W,3),dtype=np.float32)+np.array([2,3,10])
base+=np.exp(-(((xx-1510)/780)**2+((yy-550)/730)**2))[...,None]*np.array([4,9,25])
base+=np.exp(-(((xx-1300)/520)**2+((yy-300)/480)**2))[...,None]*np.array([7,2,0])
BASE=Image.fromarray(np.uint8(np.clip(base,0,255))).convert('RGBA')
rng=np.random.default_rng(18)
DOTS=[(float(rng.uniform(70,1850)),float(rng.uniform(150,1010)),float(rng.uniform(0,6.28))) for _ in range(42)]

@lru_cache(None)
def fit(name,w,h):
    im=IMAGES[name].copy(); im.thumbnail((w,h),Image.Resampling.LANCZOS); return im
def paste(im,name,x,y,w,h,alpha=1):
    src=fit(name,w,h)
    if alpha<1:
        src=src.copy();src.putalpha(src.getchannel('A').point(lambda a:int(a*alpha)))
    px=int(x+(w-src.width)/2);py=int(y+(h-src.height)/2)
    im.alpha_composite(src,(px,py))
    return px,py,src.width,src.height
def chrome(im,label,t):
    txt(im,'ADEEL',100,57,42)
    ImageDraw.Draw(im).ellipse((243,84,253,94),fill=ORANGE)
    txt(im,label,1170,67,22,MIST,450)
    line(im,(100,117),(1820,117),'#263047')
    line(im,(100,1024),(1820,1024),'#263047')
    line(im,(100,1024),(100+1720*t/DURATION,1024),ORANGE,3)
    txt(im,'RAJA ADEEL AHMED / SYSTEMS BUILDER',100,1041,17,MIST,450)
    txt(im,f'{min(5,1+sum(t>=v for v in [3.5,8,13,17])):02d} / 05',1720,1041,17,MIST,450)
def cursor(im,x,y,pulse=0):
    d=ImageDraw.Draw(im)
    if pulse>0:
        r=12+24*pulse;d.ellipse((x-r,y-r,x+r,y+r),outline=ORANGE,width=3)
    d.polygon([(x,y),(x+3,y+28),(x+11,y+21),(x+21,y+35),(x+28,y+31),(x+18,y+17),(x+31,y+15)],fill=INK,outline='#03040b',width=2)

def scene(index,u,t):
    im=BASE.copy();d=ImageDraw.Draw(im)
    for x,y,p in DOTS:
        a=int(36+12*math.sin(t*.5+p));d.ellipse((x,y+4*math.sin(t*.22+p),x+2,y+2+4*math.sin(t*.22+p)),fill=(a,a+8,a+25,255))
    e=ease(u/.65)
    if index==0:
        paste(im,'hero',945+35*(1-e),60,965,1160)
        txt(im,'AI AUTOMATION / DIGITAL SYSTEMS',105,215,23,MIST,450)
        for n,s in enumerate(['WHAT ARE YOU','STILL DOING','MANUALLY?']): txt(im,s,100,310+n*122+35*(1-e),103)
        d.ellipse((105,748,119,762),fill=ORANGE)
        txt(im,'Give your business its time back.',139,742,31,MIST,450)
        chrome(im,'LESS REPETITION. MORE POSSIBILITY.',t)
    elif index==1:
        txt(im,'Your company. One clear view.',100,161+25*(1-e),72)
        txt(im,'COMPANY COMMAND CENTER',105,262,22,ORANGE,450)
        # Actual overview and team UI; a matched push transition exposes the next view.
        x,y,w,h=240,326+int(40*(1-e)),1440,636
        panel=Image.new('RGBA',(w,h),(5,7,13,255))
        shift=int(w*smooth((u-2.25)/.65))
        paste(panel,'dashboard',-shift,0,w,h)
        if shift: paste(panel,'teams',w-shift,0,w,h)
        mask=Image.new('L',(w,h),0);ImageDraw.Draw(mask).rounded_rectangle((0,0,w-1,h-1),24,fill=255)
        panel.putalpha(mask);im.alpha_composite(panel,(x,y))
        if 1.15<u<2.6:
            p=ease((u-1.15)/.6)
            cursor(im,x+180-133*p,y+340-152*p, max(0,1-abs(u-2.15)/.2))
        chrome(im,'01 / DASHBOARDS',t)
    elif index==2:
        txt(im,'Answer. Book. Confirm.',100,161+25*(1-e),78)
        txt(im,'VOICE & TEXT BOT',105,268,22,ORANGE,450)
        paste(im,'workflow',130,330+35*(1-e),1660,550)
        labels=['BUSINESS ENQUIRIES','APPOINTMENT BOOKINGS','CONFIRMATION EMAILS']
        for j,s in enumerate(labels):
            a=ease((u-.55-j*.55)/.45)
            x=140+j*570
            if a>0:
                d.rounded_rectangle((x,922+18*(1-a),x+505,980+18*(1-a)),18,fill='#0d1424',outline='#38415a',width=1)
                d.ellipse((x+20,943+18*(1-a),x+30,953+18*(1-a)),fill=ORANGE)
                txt(im,s,x+46,940+18*(1-a),21,INK,450)
                if j<2: txt(im,'→',x+526,937,25,MIST)
        chrome(im,'02 / AI AUTOMATION',t)
    elif index==3:
        txt(im,'DAILY FITNESS',105,245,23,ORANGE,450)
        for n,s in enumerate(['Built for','everyday','progress.']): txt(im,s,100,320+n*111+25*(1-e),92)
        txt(im,'Meals. Workouts. A daily rhythm.',105,728,28,MIST,450)
        for j,k in enumerate(['phone2','phone1','phone3']):
            a=ease((u-j*.14)/.6)
            paste(im,k,960+j*286,218+(0 if j==1 else 48)+100*(1-a),274,690, a)
        chrome(im,'03 / PURPOSE-BUILT APPS',t)
    else:
        paste(im,'hero',1090+20*(1-e),90,790,1010,.82)
        txt(im,'BUSINESS,',100,246+25*(1-e),110)
        txt(im,'ON AUTOPILOT.',100,378+25*(1-e),110)
        txt(im,'AI AUTOMATION  /  APPS  /  CONNECTED SYSTEMS',105,551,25,MIST,450)
        txt(im,'Let’s build a system.',105,659,44)
        d.rounded_rectangle((100,755,987,849),23,fill=ORANGE)
        txt(im,'adeelrajpoo882@gmail.com',132,784,39,BG,450)
        txt(im,'RAJA ADEEL AHMED',105,905,24,MIST,450)
        chrome(im,'HUMAN INTELLIGENCE. SYSTEMS THINKING.',t)
    return im.convert('RGB')

CUTS=[0,3.5,8,13,17,21]
def frame(t):
    k=min(4,next((i for i in range(5) if CUTS[i]<=t<CUTS[i+1]),4))
    u=t-CUTS[k];duration=CUTS[k+1]-CUTS[k]
    im=scene(k,u,t)
    # Dip through the background, never crossfade two dense interfaces.
    alpha=min(1,u/.20) if k else 1
    if k<4:alpha=min(alpha,(duration-u)/.18)
    if alpha<1:im=Image.blend(BASE.convert('RGB'),im,max(0,alpha))
    return im

def soundtrack():
    sr=48000;n=sr*DURATION;mix=np.zeros((n,2),dtype=np.float64)
    def add(start,mono,level=1,pan=0):
        i=int(start*sr);end=min(n,i+len(mono))
        if i>=n:return
        p=np.array([math.sqrt((1-pan)/2),math.sqrt((1+pan)/2)])
        mix[i:end]+=mono[:end-i,None]*p*level
    def note(freq,dur):
        t=np.arange(int(sr*dur))/sr
        return np.sin(2*np.pi*freq*t)*np.exp(-t*3.7)*(1-np.exp(-t*65))+.16*np.sin(4*np.pi*freq*t)*np.exp(-t*6)*(1-np.exp(-t*80))
    def hz(m):return 440*2**((m-69)/12)
    chords=[[45,52,57,60,64],[41,48,53,57,60],[48,55,59,62,64],[43,50,55,59,62],[45,52,57,60,64]]
    for block,chord in enumerate(chords):
        start=block*4;dur=min(5,DURATION-start);t=np.arange(int(sr*dur))/sr
        env=np.minimum(t/.4,1)*np.minimum((dur-t)/.7,1)
        pad=sum(np.sin(2*np.pi*hz(m)*t)+.25*np.sin(2*np.pi*hz(m)*1.002*t) for m in chord[1:])/5
        add(start,pad*env,.075,-.18 if block%2 else .18)
    for beat in range(42):
        start=beat*.5;ch=chords[min(4,int(start//4))]
        t=np.arange(int(sr*.35))/sr
        kick=np.sin(2*np.pi*(47*t+8*(1-np.exp(-t*32))))*np.exp(-t*16)
        add(start,kick,.22)
        add(start,note(hz(ch[0]),.7),.14)
        if beat%2:
            noise=rng.normal(0,1,len(t));clap=np.diff(np.r_[0,noise])*np.exp(-t*34)*(1-np.exp(-t*200))
            add(start,clap,.016,.1)
        for off in [0,.25]:
            ti=np.arange(int(sr*.075))/sr
            hat=rng.normal(0,1,len(ti))*np.exp(-ti*80)*(1-np.exp(-ti*600))
            add(start+off,hat,.017,-.35 if off else .35)
        if beat>2:
            melody=note(hz(ch[2+(beat%3)])*2,.8)
            add(start+.25,melody,.055,math.sin(beat)*.4)
            add(start+.5,melody,.016,-math.sin(beat)*.4)
    for cut in CUTS[1:-1]:
        add(cut,note(hz(81),1.0)+.4*note(hz(88),1),.035,.1)
    timeline=np.arange(n)/sr
    mix*=np.minimum(timeline/.06,1)[:,None]*np.minimum((DURATION-timeline)/1.1,1)[:,None]
    mix=np.tanh(mix*1.3);mix*=.84/max(.001,np.max(np.abs(mix)))
    with wave.open(str(HERE/'soundtrack.wav'),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((mix*32767).astype('<i2').tobytes())
    print('Audio peak:',round(20*np.log10(np.max(np.abs(mix))),2),'dBFS',flush=True)

if __name__=='__main__':
    times=[1.5,3.40,3.6,5.2,6.0,6.15,7.9,8.1,10,12.9,13.15,15,16.9,17.15,19]
    for t in times: frame(t).save(HERE/f'still-{t:05.2f}.jpg',quality=91)
    contact=Image.new('RGB',(1440,math.ceil(len(times)/3)*290),BG)
    for i,t in enumerate(times):
        thumb=frame(t).resize((480,270),Image.Resampling.LANCZOS);contact.paste(thumb,((i%3)*480,(i//3)*290))
        ImageDraw.Draw(contact).text(((i%3)*480+8,(i//3)*290+273),f'{t:.2f}s',font=font(14,450),fill=INK)
    contact.save(HERE/'contact-sheet.jpg',quality=95)
    poster=frame(19);poster.save(OUT/'brag.jpg',quality=96)
    if '--preview' in sys.argv:sys.exit(0)
    soundtrack()
    cmd=[str(FFMPEG),'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
         '-i',str(HERE/'soundtrack.wav'),'-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k',
         '-t',str(DURATION),'-movflags','+faststart','-metadata','title=Adeel — Business, on autopilot.',str(OUT/'brag.mp4')]
    with open(HERE/'encode.log','w') as log:
        p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=log,stderr=log)
        for i in range(DURATION*FPS):
            p.stdin.write((poster if i==0 else frame(i/FPS)).tobytes())
            if i%60==0:print(f'Rendered {i}/{DURATION*FPS}',flush=True)
        p.stdin.close();code=p.wait()
    if code:raise RuntimeError(f'Encoder exited {code}; see encode.log')
    print('Saved',OUT/'brag.mp4',flush=True)
