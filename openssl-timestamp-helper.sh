#/bin/

# request erstellen (nur lokal), endung = tsq (time stamp query)
# openssl ts -query -data plunk.zip -cert -sha256 -no_nonce -out plunk.zip.tsq

# Anzeigen des Queries in menschenlesbarer Form (halbwegs)
# openssl ts -query -in plunk.zip.tsq -text

# dieses request and einen server schicken zum signieren und zeitstempeln
# -o plunk.zip.tsr => time stamp request
#
# Freie server: zeitstempel.dfn.de (CA chain: https://pki.pca.dfn.de/global-services-ca/cgi-bin/pub/pki?cmd=getStaticPage;name=index;id=2&RA_ID=0)
# DFN CA chain direct download: https://pki.pca.dfn.de/global-services-ca/pub/cacert/chain.txt (.pem Format, einfach umbennenen)
# z.B. via: curl -o dfn-cert-chain.pem https://pki.pca.dfn.de/global-services-ca/pub/cacert/chain.txt
#
# SwissSign (keine Anmeldung notwendig!)
# http://tsa.swisssign.net
# Zertifikate: ??
# cat plunk.zip | curl -s -S -H 'Content-Type: application/timestamp-query' --data-binary @- http://zeitstempel.dfn.de -o plunk.zip.tsr

# Anzeigen des Replys in menschenlesbarer Form (halbwegs)
# openssl ts -reply -in plunk.zip.tsr -text

# Verifizieren des Zeitstempels mittels Zertifikat(skette) des Anbieters
# Dabei muss natürlich die originaldatei mitangegeben werden wegen der Prüfsumme
# openssl ts -verify -in plunk.zip.tsr -data plunk.zip dfn-cert-chain.pem

