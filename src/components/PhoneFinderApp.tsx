import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Smartphone, MessageSquare, Volume2, Settings, Zap } from 'lucide-react';

interface SmsMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  triggered: boolean;
}

const PhoneFinderApp = () => {
  const [keyword, setKeyword] = useState('ACHARCELULAR123');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [testSender, setTestSender] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const { toast } = useToast();

  // Simula o recebimento de SMS
  const simulateIncomingSms = (sender: string, message: string) => {
    const newSms: SmsMessage = {
      id: Date.now().toString(),
      sender,
      message,
      timestamp: new Date(),
      triggered: message.includes(keyword)
    };

    setSmsMessages(prev => [newSms, ...prev.slice(0, 9)]);

    if (newSms.triggered) {
      activateAlarm();
      toast({
        title: "🚨 Celular Encontrado!",
        description: `Palavra-chave detectada em SMS de ${sender}`,
        variant: "default",
      });
    }
  };

  const activateAlarm = () => {
    setIsAlarmActive(true);
    
    // Simula som de alarme
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    
    oscillator.start();
    
    // Para o som após 3 segundos
    setTimeout(() => {
      oscillator.stop();
      setIsAlarmActive(false);
    }, 3000);
  };

  const handleTestSms = () => {
    if (!testSender || !testMessage) {
      toast({
        title: "Erro",
        description: "Preencha o remetente e a mensagem",
        variant: "destructive",
      });
      return;
    }

    simulateIncomingSms(testSender, testMessage);
    setTestSender('');
    setTestMessage('');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Encontre Meu Celular</h1>
          </div>
          <p className="text-muted-foreground">
            Configure uma palavra-chave e encontre seu celular via SMS
          </p>
        </div>

        {/* Status Card */}
        <Card className={`border-2 transition-all duration-300 ${
          isAlarmActive 
            ? 'border-destructive bg-destructive/10 animate-pulse' 
            : 'border-primary bg-primary/5'
        }`}>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {isAlarmActive ? (
                <>
                  <Volume2 className="h-6 w-6 text-destructive animate-bounce" />
                  ALARME ATIVO!
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6 text-primary" />
                  Sistema Ativo
                </>
              )}
            </CardTitle>
            <CardDescription>
              {isAlarmActive 
                ? 'Seu celular está tocando o alarme!' 
                : 'Aguardando SMS com palavra-chave'
              }
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Configurações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Configure a palavra-chave secreta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Palavra-chave atual:</label>
                <Input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value.toUpperCase())}
                  placeholder="Digite a palavra-chave"
                  className="font-mono"
                />
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Como usar:</strong> Envie um SMS com a palavra-chave "{keyword}" 
                  para este celular e ele irá tocar automaticamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Teste de SMS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Teste de SMS
              </CardTitle>
              <CardDescription>
                Simule o recebimento de um SMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  value={testSender}
                  onChange={(e) => setTestSender(e.target.value)}
                  placeholder="Número do remetente"
                />
                <Input
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="Mensagem do SMS"
                />
              </div>
              <Button onClick={handleTestSms} className="w-full">
                Simular SMS Recebido
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Histórico de SMS */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de SMS</CardTitle>
            <CardDescription>
              Últimas mensagens recebidas (simuladas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {smsMessages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum SMS recebido ainda. Use o teste acima para simular.
              </p>
            ) : (
              <div className="space-y-3">
                {smsMessages.map((sms) => (
                  <div
                    key={sms.id}
                    className={`p-3 rounded-lg border ${
                      sms.triggered
                        ? 'border-success bg-success/10'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{sms.sender}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(sms.timestamp)}
                          </span>
                          {sms.triggered && (
                            <Badge variant="default" className="bg-success text-success-foreground">
                              Ativado!
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{sms.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhoneFinderApp;