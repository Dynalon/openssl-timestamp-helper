"use strict";

export var openssl: string = "/usr/local/Cellar/openssl/1.0.2e/bin/openssl";
export var curl: string = "curl";

export interface TimestampProvider {
    /**
     * A name for the provider so we can identify it later on the cmdline. Will also be appended
     * as filename suffix by default, i.e:
     *
     *     filename.providername.tsq
     *     filename.providername.tsr
     *
     * Should thus be lowercase and contain no spaces or upper ASCII symbols.
     */
    name: string;

    /**
     * The http(s) URL to the timestamping service.
     */
    tsEndpoint: string;

    /**
     * Certificate chain in PEM format as multiline string embedded
     */
    certificateChain: string;

    /**
     * Main URL to the service provider with details about the service, like costs and so forth
     */
    documentationUrl?: string;

    /**
     * A link to a human readable website / information about the certificate chain or a description
     * for end users how verification/certificate obtaining can be performed.
     * @type {[type]}
     */
    certificateChainHintUrl?: string;
}

export class DfnProvider implements TimestampProvider {
    name = "DFN";
    tsEndpoint = "http://zeitstempel.dfn.de";
    documentationUrl = "https://www.pki.dfn.de/zeitstempeldienst/"
    certificatechainHintUrl = "https://pki.pca.dfn.de/global-services-ca/cgi-bin/pub/pki?cmd=getStaticPage;name=index;id=2&RA_ID=0";

    // Not Before: May  6 15:27:51 2014 GMT
    // Not After : Jul  9 23:59:00 2019 GMT
    certificateChain = `SHA-2 chain, PCA Jul 14
subject= /C=DE/O=DFN-Verein/OU=DFN-PKI/CN=DFN-Verein CA Services
-----BEGIN CERTIFICATE-----
MIIFEjCCA/qgAwIBAgIHF4h9B2deJDANBgkqhkiG9w0BAQsFADBaMQswCQYDVQQG
EwJERTETMBEGA1UEChMKREZOLVZlcmVpbjEQMA4GA1UECxMHREZOLVBLSTEkMCIG
A1UEAxMbREZOLVZlcmVpbiBQQ0EgR2xvYmFsIC0gRzAxMB4XDTE0MDUwNjE1Mjc1
MVoXDTE5MDcwOTIzNTkwMFowVTELMAkGA1UEBhMCREUxEzARBgNVBAoTCkRGTi1W
ZXJlaW4xEDAOBgNVBAsTB0RGTi1QS0kxHzAdBgNVBAMTFkRGTi1WZXJlaW4gQ0Eg
U2VydmljZXMwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCoJb9T3NY7
K60rZDMvWrSrGIb8+eGrdcasn5LIrta5i2OTazMQzAD1LNNYj6JF1btlNbpwfmHu
tWEHXxshnL9lPaBOlL7VLdqpxfuBgbYWS4wN18gkvAEoBStnN0pCF/FZV9aLkuuK
/iQEwHpaTLsJqfOH279Aud1TqEOSrnqX0PjuwqjaG7fHj28b+MW5J8CxSOWoylF3
OUDsFKdF6ccWu4F7rLymDVEDe/tCrUqCIBguB3Yb2LxRn4ga6RnMrSzAHtzr40Gg
R/gJ4OOLKNtH9b54uhMZi5v05oz3/LHTopY2/gZY8z1RgNdZnMs60bBt1HMfhZum
NaJlNyCtOmEJAgMBAAGjggHgMIIB3DASBgNVHRMBAf8ECDAGAQH/AgEBMA4GA1Ud
DwEB/wQEAwIBBjARBgNVHSAECjAIMAYGBFUdIAAwHQYDVR0OBBYEFB2p8YYmdk3P
Xf1Qo27r8bwidW3rMB8GA1UdIwQYMBaAFEm3xs/oPR9/6kR7Eyn38QpwPt5kMIGI
BgNVHR8EgYAwfjA9oDugOYY3aHR0cDovL2NkcDEucGNhLmRmbi5kZS9nbG9iYWwt
cm9vdC1jYS9wdWIvY3JsL2NhY3JsLmNybDA9oDugOYY3aHR0cDovL2NkcDIucGNh
LmRmbi5kZS9nbG9iYWwtcm9vdC1jYS9wdWIvY3JsL2NhY3JsLmNybDCB1wYIKwYB
BQUHAQEEgcowgccwMwYIKwYBBQUHMAGGJ2h0dHA6Ly9vY3NwLnBjYS5kZm4uZGUv
T0NTUC1TZXJ2ZXIvT0NTUDBHBggrBgEFBQcwAoY7aHR0cDovL2NkcDEucGNhLmRm
bi5kZS9nbG9iYWwtcm9vdC1jYS9wdWIvY2FjZXJ0L2NhY2VydC5jcnQwRwYIKwYB
BQUHMAKGO2h0dHA6Ly9jZHAyLnBjYS5kZm4uZGUvZ2xvYmFsLXJvb3QtY2EvcHVi
L2NhY2VydC9jYWNlcnQuY3J0MA0GCSqGSIb3DQEBCwUAA4IBAQBuX+V472GlQTm1
CbKkoyIg1SIPGoPPw8X4gZATi6jQjfA0h81EZ3NZhjJabaHbBhLxPR49QD2Fd1t+
edWb3NnoXTNZKUXnMbVvNeG/Uaq3ykGQb/A6gLKkPnLWHLfJIdPtClLTHvNEHAf5
AoD1/O9KrUH+NMhG1QPCVR4ODVSL/bUH6O3ymKc9cHWSMtotCVEZ4bbZ71y6ZBQc
0n3oqed0dpqG1aE3pChWM8Pi4t41DU0aaLtN6QHlRYZn+66NYEdiYxrZvWec3sPJ
FJgCUhltDxa1XM/8MOZoHuPgEbZDTDphIgV/+QWY+XB7ESMc2zmV5PFLye5a/IWR
URtf8EkZ
-----END CERTIFICATE-----
subject= /C=DE/O=DFN-Verein/OU=DFN-PKI/CN=DFN-Verein PCA Global - G01
-----BEGIN CERTIFICATE-----
MIIE1TCCA72gAwIBAgIIUE7G9T0RtGQwDQYJKoZIhvcNAQELBQAwcTELMAkGA1UE
BhMCREUxHDAaBgNVBAoTE0RldXRzY2hlIFRlbGVrb20gQUcxHzAdBgNVBAsTFlQt
VGVsZVNlYyBUcnVzdCBDZW50ZXIxIzAhBgNVBAMTGkRldXRzY2hlIFRlbGVrb20g
Um9vdCBDQSAyMB4XDTE0MDcyMjEyMDgyNloXDTE5MDcwOTIzNTkwMFowWjELMAkG
A1UEBhMCREUxEzARBgNVBAoTCkRGTi1WZXJlaW4xEDAOBgNVBAsTB0RGTi1QS0kx
JDAiBgNVBAMTG0RGTi1WZXJlaW4gUENBIEdsb2JhbCAtIEcwMTCCASIwDQYJKoZI
hvcNAQEBBQADggEPADCCAQoCggEBAOmbw2eF+Q2u9Y1Uw5ZQNT1i6W5M7ZTXAFuV
InTUIOs0j9bswDEEC5mB4qYU0lKgKCOEi3SJBF5b4OJ4wXjLFssoNTl7LZBF0O2g
AHp8v0oOGwDDhulcKzERewzzgiRDjBw4i2poAJru3E94q9LGE5t2re7eJujvAa90
D8EJovZrzr3TzRQwT/Xl46TIYpuCGgMnMA0CZWBN7dEJIyqWNVgn03bGcbaQHcTt
/zWGfW8zs9sPxRHCioOhlF1Ba9jSEPVM/cpRrNm975KDu9rrixZWVkPP4dUTPaYf
JzDNSVTbyRM0mnF1xWzqpwuY+SGdJ68+ozk5SGqMrcmZ+8MS8r0CAwEAAaOCAYYw
ggGCMA4GA1UdDwEB/wQEAwIBBjAdBgNVHQ4EFgQUSbfGz+g9H3/qRHsTKffxCnA+
3mQwHwYDVR0jBBgwFoAUMcN5G7r1U9cX4Il6LRdsCrMrnTMwEgYDVR0TAQH/BAgw
BgEB/wIBAjBiBgNVHSAEWzBZMBEGDysGAQQBga0hgiwBAQQCAjARBg8rBgEEAYGt
IYIsAQEEAwAwEQYPKwYBBAGBrSGCLAEBBAMBMA8GDSsGAQQBga0hgiwBAQQwDQYL
KwYBBAGBrSGCLB4wPgYDVR0fBDcwNTAzoDGgL4YtaHR0cDovL3BraTAzMzYudGVs
ZXNlYy5kZS9ybC9EVF9ST09UX0NBXzIuY3JsMHgGCCsGAQUFBwEBBGwwajAsBggr
BgEFBQcwAYYgaHR0cDovL29jc3AwMzM2LnRlbGVzZWMuZGUvb2NzcHIwOgYIKwYB
BQUHMAKGLmh0dHA6Ly9wa2kwMzM2LnRlbGVzZWMuZGUvY3J0L0RUX1JPT1RfQ0Ff
Mi5jZXIwDQYJKoZIhvcNAQELBQADggEBAGMgKP2cIYZyvjlGWTkyJbypAZsNzMp9
QZyGbQpuLLMTWXWxM5IbYScW/8Oy1TWC+4QqAUm9ZrtmL7LCBl1uP27jAVpbykNj
XJW24TGnH9UHX03mZYJOMvnDfHpLzU1cdO4h8nUC7FI+0slq05AjbklnNb5/TVak
7Mwvz7ehl6hyPsm8QNZapAg91ryCw7e3Mo6xLI5qbbc1AhnP9TlEWGOnJAAQsLv8
Tq9uLzi7pVdJP9huUG8sl5bcHUaaZYnPrszy5dmfU7M+oS+SqdgLxoQfBMbrHuif
fbV7pQLxJMUkYxE0zFqTICp5iDolQpCpZTt8htMSFSMp/CzazDlbVBc=
-----END CERTIFICATE-----
subject= /C=DE/O=Deutsche Telekom AG/OU=T-TeleSec Trust Center/CN=Deutsche Telekom Root CA 2
-----BEGIN CERTIFICATE-----
MIIDnzCCAoegAwIBAgIBJjANBgkqhkiG9w0BAQUFADBxMQswCQYDVQQGEwJERTEc
MBoGA1UEChMTRGV1dHNjaGUgVGVsZWtvbSBBRzEfMB0GA1UECxMWVC1UZWxlU2Vj
IFRydXN0IENlbnRlcjEjMCEGA1UEAxMaRGV1dHNjaGUgVGVsZWtvbSBSb290IENB
IDIwHhcNOTkwNzA5MTIxMTAwWhcNMTkwNzA5MjM1OTAwWjBxMQswCQYDVQQGEwJE
RTEcMBoGA1UEChMTRGV1dHNjaGUgVGVsZWtvbSBBRzEfMB0GA1UECxMWVC1UZWxl
U2VjIFRydXN0IENlbnRlcjEjMCEGA1UEAxMaRGV1dHNjaGUgVGVsZWtvbSBSb290
IENBIDIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCrC6M14IspFLEU
ha88EOQ5bzVdSq7d6mGNlUn0b2SjGmBmpKlAIoTZ1KXleJMOaAGtuU1cOs7TuKhC
QN/Po7qCWWqSG6wcmtoIKyUn+WkjR/Hg6yx6m/UTAtB+NHzCnjwAWav12gz1Mjwr
rFDa1sPeg5TKqAyZMg4ISFZbavva4VhYAUlfckE8FQYBjl2tqriTtM2e66foai1S
NNs671x1Udrb8zH57nGYMsRUFUQM+ZtV7a3fGAigo4aKSe5TBY8ZTNXeWHmb0moc
QqvF1afPaA+W5OFhmHZhyJF81j4A4pFQh+GdCuatl9Idxjp9y7zaAzTVjlsB9WoH
txa2bkp/AgMBAAGjQjBAMB0GA1UdDgQWBBQxw3kbuvVT1xfgiXotF2wKsyudMzAP
BgNVHRMECDAGAQH/AgEFMA4GA1UdDwEB/wQEAwIBBjANBgkqhkiG9w0BAQUFAAOC
AQEAlGRZrTlk5ynrE/5aw4sTV8gEJPB0d8Bg42f76Ymmg7+Wgnxu1MM9756Abrsp
tJh6sTtU6zkXR34ajgv8HzFZMQSyzhfzLMdiNlXiItiJVbSYSKpk+tYcNthEeFpa
IzpXl/V6ME+un2pMSyuOoAPjPuCp1NJ70rOo4nI8rZ7/gFnkm0W09juwzTkZmDLl
6iFhkOQxIY40sfcvNUqFENrnijchvllj4PKFiDFT1FQUhXB59C4Gdyd1Lx+4ivn+
xbrYNuSD7Odlt79jWvNGr4GUN9RBjNYj1h7P9WgbRGOiWrqnNVmh5XAFmw4jV5mU
Cm26OWMohpLzGITY+9HPBVZkVw==
-----END CERTIFICATE-----`;
}

export class SwissSignProvider implements TimestampProvider {
    name = "SwissSign";
    tsEndpoint = "http://tsa.swisssign.net";
    certificateChain = "";
}
