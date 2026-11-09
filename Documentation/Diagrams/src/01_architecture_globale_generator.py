W,H=1600,920
F="DejaVu Sans Condensed, Arial, sans-serif"
INK="#222"; RED="#E04A2F"; BLUE="#1C74C9"; GREEN="#2E8B3A"; GRAY="#8A8A8A"
o=[]
a=o.append
a(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="{F}">')
a('''<defs>
<marker id="mr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#E04A2F"/></marker>
<marker id="mb" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#1C74C9"/></marker>
<marker id="mg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#2E8B3A"/></marker>
<marker id="mk" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#222"/></marker>
</defs>''')
a(f'<rect width="{W}" height="{H}" fill="#FFFFFF"/>')
def t(x,y,s,size=12,w="400",fill=INK,anchor="start",extra=""):
    a(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}" {extra}>{s}</text>')
def halo(x,y,s,size,fill,anchor="start",w="400"):
    a(f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}" stroke="#FFFFFF" stroke-width="3" paint-order="stroke">{s}</text>')
# title + zone labels
a(f'<text x="1000" y="38" font-size="30" font-weight="700" text-anchor="middle" fill="#111" font-family="DejaVu Serif, Times New Roman, serif">Vue d’ensemble de l’architecture SplitPay</text>')
t(102,34,"Réseau public",13,"700",INK,"middle"); t(275,34,"Réseau privé",13,"700")
# public box
a('<rect x="40" y="60" width="125" height="630" rx="4" fill="none" stroke="#333" stroke-width="1.3" stroke-dasharray="6 4"/>')
def card(y,l1,l2):
    a(f'<rect x="50" y="{y}" width="105" height="104" rx="8" fill="#fff" stroke="#BBB"/>')
    a(f'<polygon points="102,{y+12} 118,{y+18} 116,{y+38} 102,{y+46} 88,{y+38} 86,{y+18}" fill="#DD0031"/>')
    t(102,y+37,"A",17,"700","#fff","middle")
    t(102,y+66,l1,11.5,"700",INK,"middle"); t(102,y+81,l2,10,"400","#555","middle")
card(110,"Application web","Angular · étudiant"); card(240,"Espace admin","Angular · alertes SSE")
t(102,440,"Chaque appel passe",11,"400","#444","middle"); t(102,454,"par la gateway avec",11,"400","#444","middle"); t(102,468,"un <tspan font-weight=\"700\">Bearer JWT</tspan>",11,"400","#444","middle")
a('<rect x="52" y="635" width="100" height="30" rx="6" fill="#7BA7E0"/>'); t(102,655,"Côté client",12,"700","#fff","middle")
# gateway
a('<rect x="185" y="60" width="60" height="630" rx="5" fill="#1E9BD7"/>')
a('<circle cx="215" cy="92" r="17" fill="#fff"/><circle cx="215" cy="92" r="12" fill="#6DB33F"/><path d="M209 98 Q209 84 222 85 Q221 97 209 98Z" fill="#fff"/>')
a('<text transform="translate(212,390) rotate(-90)" font-size="25" font-weight="700" fill="#fff" text-anchor="middle">API Gateway</text>')
a('<text transform="translate(234,390) rotate(-90)" font-size="12" fill="#fff" text-anchor="middle">Spring Cloud Gateway · :8080</text>')
# private outer + dashed
a(f'<rect x="262" y="44" width="1323" height="861" fill="none" stroke="#333" stroke-width="1.3"/>')
a('<rect x="282" y="70" width="890" height="635" rx="3" fill="none" stroke="#333" stroke-width="1.4" stroke-dasharray="7 5"/>')
t(292,88,"<tspan font-weight=\"700\">Microservices métier</tspan> · un conteneur chacun (réseau Docker Compose <tspan font-style=\"italic\">splitpay-net</tspan>)",11.5)
# docker
a('<g transform="translate(1075,80)"><rect x="0" y="8" width="26" height="10" rx="2" fill="#2496ED"/><rect x="4" y="2" width="5" height="5" fill="#2496ED"/><rect x="11" y="2" width="5" height="5" fill="#2496ED"/><rect x="18" y="2" width="5" height="5" fill="#2496ED"/></g>')
t(1106,92,"<tspan font-weight=\"700\">Docker</tspan>",11,"400","#2496ED"); t(1106,104,"Compose",11,"700","#2496ED")
# services
S=[("MS1 · account","8081","ACCOUNT","account_db","PostgreSQL","/api/users/** → lb://ACCOUNT","publie user.registered",True,"#fff"),
("MS2 · wallet","8082","WALLET","wallet_db","PostgreSQL","/api/wallets/** → lb://WALLET","publie wallet.debited",True,"#fff"),
("MS3 · expense","8083","EXPENSE","expense_db","MongoDB","/api/expenses/** → lb://EXPENSE","publie expense.created",True,"#fff"),
("MS4 · settlement","8084","SETTLEMENT","settlement_db","PostgreSQL","/api/debts/** → lb://SETTLEMENT","publie debt.settled",True,"#fff"),
("MS5 · recurring","8085","RECURRING","recurring_db","PostgreSQL","/api/recurring/** → lb://RECURRING","consomme expense.created",True,"#fff"),
("MS6 · savings","8086","SAVINGS","savings_db","PostgreSQL","/api/savings/** → lb://SAVINGS","consomme wallet.debited",True,"#fff"),
("MS7 · fraud (avancé)","8087","FRAUD","fraud_db","PostgreSQL","/api/fraud/** → lb://FRAUD","consomme wallet.debited",True,"#FFF6CF"),
("MS8 · notification","8088","NOTIFICATION","notification_db","PostgreSQL","/api/notifications/** → lb://NOTIFICATION","consomme → notifier",False,"#F1E9FA")]
X0=600; BW=210; BH=56; Y0=100; P=74; BARX=1090
Y=[Y0+i*P for i in range(8)]
# red lines first
for i,s in enumerate(S):
    y=Y[i]+50
    a(f'<line x1="245" y1="{y}" x2="{X0-2}" y2="{y}" stroke="{RED}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#mr)"/>')
    halo(X0-8,y-4,s[5],10,RED,"end")
# green lines
for i,s in enumerate(S):
    y=Y[i]+52
    x1=X0+BW; x2=BARX
    if s[7]:
        a(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="{GREEN}" stroke-width="1.5" stroke-dasharray="6 4" marker-start="url(#mg)" marker-end="url(#mg)"/>')
    else:
        a(f'<line x1="{x2}" y1="{y}" x2="{x1}" y2="{y}" stroke="{GREEN}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#mg)"/>')
    halo(1082,y+13,s[6],10,GREEN,"end")
# blue lanes
E=[(1,2,1),(2,3,1),(3,4,2),(4,5,3),(5,6,2),(6,7,1),(7,8,1),(8,1,2)]  # (num,caller,callee) placeholder fixed below
E=[(1,2,1),(2,3,1),(3,4,2),(4,5,3),(5,6,2),(6,7,1),(7,8,1),(8,1,2)]
lane={7:290,6:302,5:314,2:326,3:338,4:350,1:362,8:374}
cnt={}
for n,cr,ce in sorted(E,key=lambda e:lane[e[0]]):
    k=cnt.get(ce,0); cnt[ce]=k+1
    ys=Y[cr-1]+8; ye=Y[ce-1]+16+5*k; lx=lane[n]
    a(f'<path d="M{X0} {ys} H{lx} V{ye} H{X0-1}" fill="none" stroke="{BLUE}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#mb)"/>')
    a(f'<circle cx="{X0-22}" cy="{ys}" r="8" fill="{BLUE}"/>'); t(X0-22,ys+4,str(n),11,"700","#fff","middle")
# service boxes + DB
for i,s in enumerate(S):
    y=Y[i]
    a(f'<rect x="{X0}" y="{y}" width="{BW}" height="{BH}" rx="8" fill="{s[8]}" stroke="#444" stroke-width="1.4"/>')
    a(f'<circle cx="{X0+24}" cy="{y+22}" r="13" fill="#6DB33F"/><path d="M{X0+18} {y+28} Q{X0+18} {y+14} {X0+31} {y+15} Q{X0+30} {y+27} {X0+18} {y+28}Z" fill="#fff"/>')
    t(X0+46,y+22,s[0],14,"700"); t(X0+46,y+38,f"Spring Boot · :{s[1]}",11.5); t(X0+46,y+51,f"Eureka : {s[2]}",10,"400","#666")
    # gray db link
    for dy in (26,30):
        a(f'<line x1="{X0+BW}" y1="{y+dy}" x2="{X0+BW+26}" y2="{y+dy}" stroke="{GRAY}" stroke-width="1"/>')
    bx=X0+BW+26; by=y+5
    a(f'<path d="M{bx} {by+7} V{by+37} A40 7 0 0 0 {bx+80} {by+37} V{by+7}" fill="#fff" stroke="#555" stroke-width="1.2"/><ellipse cx="{bx+40}" cy="{by+7}" rx="40" ry="7" fill="#F4F4F4" stroke="#555" stroke-width="1.2"/>')
    t(bx+40,by+26,s[3],10,"700",INK,"middle"); t(bx+40,by+37,s[4],9.5,"400","#555","middle")
# redis for fraud (row 7)
yf=Y[6]; rx=X0+BW+26+80+16
for dy in (24,28):
    a(f'<line x1="{rx-16}" y1="{yf+dy+5}" x2="{rx}" y2="{yf+dy+5}" stroke="{GRAY}" stroke-width="1"/>')
a(f'<path d="M{rx} {yf+12} V{yf+42} A40 7 0 0 0 {rx+80} {yf+42} V{yf+12}" fill="#FFE3E0" stroke="#B33" stroke-width="1.2"/><ellipse cx="{rx+40}" cy="{yf+12}" rx="40" ry="7" fill="#FFD0CC" stroke="#B33" stroke-width="1.2"/>')
t(rx+40,yf+31,"Redis :6379",10,"700",INK,"middle"); t(rx+40,yf+42,"compteurs",9.5,"400","#555","middle")
# rabbit bar
a(f'<rect x="{BARX}" y="106" width="64" height="586" rx="10" fill="#FFE9CC" stroke="#F58220" stroke-width="2"/>')
a(f'<rect x="{BARX+18}" y="118" width="28" height="28" rx="4" fill="#F58220"/><path d="M{BARX+25} 142 V128 H{BARX+30} V134 H{BARX+34} V128 H{BARX+39} V142Z" fill="#fff"/>')
a(f'<text transform="translate({BARX+27},400) rotate(-90)" font-size="14" font-weight="700" text-anchor="middle" fill="{INK}">RabbitMQ · courtier de messages · :5672 (UI :15672)</text>')
a(f'<text transform="translate({BARX+47},400) rotate(-90)" font-size="12" text-anchor="middle" fill="{INK}">exchange <tspan font-weight="700">splitpay.events</tspan> (topic) — événements asynchrones</text>')
# sync table (right zone)
tx=1195; ty=100
a(f'<rect x="{tx}" y="{ty}" width="372" height="340" rx="10" fill="#F6FAFF" stroke="#B9D3F0"/>')
t(tx+16,ty+26,"Appels synchrones (OpenFeign)",14,"700",BLUE)
rows=[("wallet → account","GET /users/{id}/kyc-status"),("expense → account","GET /groups/{id}/members"),("settlement → wallet","POST /wallets/transfers"),("recurring → expense","POST /expenses"),("savings → wallet","POST /wallets/transfers (ROUNDUP)"),("fraud → account","GET /users/{id}"),("notification → account","GET /users/{id}/contact"),("account → wallet","GET /wallets/by-user/{id}")]
for k,(l1,l2) in enumerate(rows):
    y=ty+56+k*34
    a(f'<circle cx="{tx+24}" cy="{y}" r="9" fill="{BLUE}"/>'); t(tx+24,y+4,str(k+1),11,"700","#fff","middle")
    t(tx+42,y-2,l1,12,"700"); t(tx+42,y+13,l2,10.5,"400","#444")
# event note
a(f'<rect x="{tx}" y="{ty+360}" width="372" height="170" rx="10" fill="#F4FBF5" stroke="#B7DEBE"/>')
t(tx+16,ty+386,"Événements asynchrones (RabbitMQ)",14,"700",GREEN)
ev=["Flèche double : le service publie et consomme","expense.created → settlement (dettes), recurring","debt.settled → expense (part payée)","wallet.debited → savings (arrondi), fraud","fraud.alert-raised → wallet (gel), notification","Notification : consomme les événements métier"]
for k,l in enumerate(ev): t(tx+16,ty+412+k*20,l,11,"400","#333")
# bottom infra
def infra(x,y,w,l1,l2):
    a(f'<rect x="{x}" y="{y}" width="{w}" height="56" rx="8" fill="#FFE2B8" stroke="#E0A040" stroke-width="1.4"/>')
    a(f'<circle cx="{x+22}" cy="{y+24}" r="12" fill="#6DB33F"/><path d="M{x+16} {y+30} Q{x+16} {y+16} {x+29} {y+17} Q{x+28} {y+29} {x+16} {y+30}Z" fill="#fff"/>')
    t(x+42,y+24,l1,13.5,"700"); t(x+42,y+41,l2,11,"400","#444")
infra(430,745,230,"Eureka Server · :8761","annuaire de services")
infra(800,745,230,"Config Server · :8888","Spring Cloud Config")
a('<rect x="1085" y="738" width="130" height="70" rx="6" fill="#fff" stroke="#333" stroke-dasharray="5 3"/>')
a('<circle cx="1110" cy="773" r="13" fill="#222"/>'); t(1130,770,"config-repo",12,"700"); t(1130,786,"Git (GitHub)",10.5,"400","#444")
a('<rect x="40" y="745" width="190" height="62" rx="8" fill="#FFE2B8" stroke="#E0A040" stroke-width="1.4"/>')
t(60,770,"Keycloak · :8180",13.5,"700"); t(60,788,"fournisseur d’identité",11,"400","#444"); t(60,801,"realm splitpay",9.5,"400","#666")
a('<rect x="560" y="835" width="110" height="30" rx="6" fill="#7BA7E0"/>'); t(615,855,"Côté backend",12,"700","#fff","middle")
# infra arrows
a(f'<line x1="102" y1="690" x2="102" y2="744" stroke="{RED}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#mr)"/>'); t(108,722,"login → JWT",10.5,"400",RED)
a(f'<line x1="205" y1="744" x2="205" y2="691" stroke="{RED}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#mr)"/>'); t(214,722,"valide le JWT",10.5,"400",RED); t(214,734,"(clés publiques)",10.5,"400",RED)
a('<path d="M240 691 V790 H430" fill="none" stroke="#222" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#mk)"/>'); t(300,774,"récupère le registre",10.5,"400","#222"); t(300,762,"(résout lb://)",10.5,"400","#222")
a('<line x1="540" y1="705" x2="540" y2="744" stroke="#222" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#mk)"/>'); t(548,722,"enregistrement + heartbeat (30 s)",10.5,"400","#222"); t(548,734,"+ récupération du registre",10.5,"400","#222")
a('<line x1="800" y1="773" x2="662" y2="773" stroke="#222" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#mk)"/>'); t(731,766,"enregistrement",10.5,"400","#222","middle")
a('<line x1="915" y1="744" x2="915" y2="706" stroke="#222" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#mk)"/>'); t(923,722,"configuration au démarrage",10.5,"400","#222")
a('<line x1="1085" y1="773" x2="1032" y2="773" stroke="#222" stroke-width="1.3" stroke-dasharray="5 4" marker-end="url(#mk)"/>')
# legend
lx=1245; ly=725
a(f'<rect x="{lx}" y="{ly}" width="325" height="165" rx="8" fill="#fff" stroke="#999"/>'); t(lx+14,ly+22,"Légende",13,"700")
L=[(RED,"mr","HTTP via la gateway (route → lb://NOM)",False),(BLUE,"mb","Appel synchrone entre services (OpenFeign)",False),(GREEN,"mg","Événement asynchrone (RabbitMQ)",False),("#222","mk","Découverte de services / configuration",False)]
for k,(c,m,l,_) in enumerate(L):
    y=ly+44+k*24
    a(f'<line x1="{lx+14}" y1="{y}" x2="{lx+60}" y2="{y}" stroke="{c}" stroke-width="1.5" stroke-dasharray="6 4" marker-end="url(#{m})"/>'); t(lx+72,y+4,l,11)
y=ly+44+4*24
for dy in (-2,2): a(f'<line x1="{lx+14}" y1="{y+dy}" x2="{lx+60}" y2="{y+dy}" stroke="{GRAY}" stroke-width="1"/>')
t(lx+72,y+4,"Accès base de données (une base par service)",11)
a('</svg>')
open("splitpay_arch.svg","w").write("\n".join(o))
