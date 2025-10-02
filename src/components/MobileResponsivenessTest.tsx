import React, { useState } from "react";
import {
  FiMonitor,
  FiSmartphone,
  FiTablet,
  FiX,
  FiCheck,
} from "react-icons/fi";

export function MobileResponsivenessTest() {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50 touch-button"
        title="Teste de Responsividade"
      >
        <FiMonitor className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-white border border-gray-300 rounded-lg shadow-2xl z-50 overflow-y-auto">
      <div className="mobile-card-header">
        <div className="flex items-center justify-between">
          <h3 className="mobile-heading">Teste de Responsividade</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="touch-button p-2 text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mobile-card-content space-y-6">
        {/* Teste de Botões */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Botões Touch-Friendly
          </h4>
          <div className="mobile-stack">
            <button className="mobile-btn-primary">
              <FiCheck className="w-4 h-4 mr-2" />
              Primário
            </button>
            <button className="mobile-btn-secondary">Secundário</button>
            <button className="mobile-btn-danger">Perigo</button>
            <button className="mobile-btn-ghost">Fantasma</button>
          </div>
        </section>

        {/* Teste de Formulários */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Formulários Responsivos
          </h4>
          <div className="mobile-form-grid">
            <div className="mobile-form-group">
              <label className="mobile-form-label">Nome</label>
              <input
                type="text"
                className="touch-input"
                placeholder="Digite seu nome"
              />
            </div>
            <div className="mobile-form-group">
              <label className="mobile-form-label">Email</label>
              <input
                type="email"
                className="touch-input"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div className="mobile-form-group">
            <label className="mobile-form-label">Mensagem</label>
            <textarea
              className="mobile-textarea"
              placeholder="Digite sua mensagem"
            ></textarea>
          </div>
          <div className="mobile-form-group">
            <label className="mobile-form-label">Categoria</label>
            <select className="mobile-select">
              <option>Selecione uma opção</option>
              <option>Opção 1</option>
              <option>Opção 2</option>
            </select>
          </div>
        </section>

        {/* Teste de Cards */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Cards Responsivos
          </h4>
          <div className="mobile-grid">
            <div className="mobile-card">
              <div className="mobile-card-header">
                <h5 className="mobile-card-title">Card 1</h5>
                <p className="mobile-card-subtitle">Descrição do card</p>
              </div>
              <div className="mobile-card-content">
                <p className="mobile-text-sm">
                  Este é um exemplo de card responsivo que se adapta ao tamanho
                  da tela.
                </p>
              </div>
              <div className="mobile-card-footer">
                <button className="mobile-btn-primary">Ação</button>
              </div>
            </div>
            <div className="mobile-card">
              <div className="mobile-card-header">
                <h5 className="mobile-card-title">Card 2</h5>
                <p className="mobile-card-subtitle">Outro card</p>
              </div>
              <div className="mobile-card-content">
                <p className="mobile-text-sm">
                  Cards se reorganizam automaticamente em diferentes tamanhos de
                  tela.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Teste de Status */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Status e Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="mobile-status-badge bg-green-100 text-green-800">
              Ativo
            </span>
            <span className="mobile-status-badge bg-yellow-100 text-yellow-800">
              Pendente
            </span>
            <span className="mobile-status-badge bg-red-100 text-red-800">
              Inativo
            </span>
            <span className="mobile-status-badge bg-blue-100 text-blue-800">
              Em Progresso
            </span>
          </div>
        </section>

        {/* Teste de Tipografia */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Tipografia Responsiva
          </h4>
          <div className="space-y-2">
            <h1 className="mobile-title">Título Principal</h1>
            <h2 className="mobile-heading">Cabeçalho</h2>
            <p className="mobile-text-base">
              Texto base que se adapta ao tamanho da tela
            </p>
            <p className="mobile-text-sm">
              Texto menor para informações secundárias
            </p>
            <p className="mobile-text-xs">Texto muito pequeno para detalhes</p>
          </div>
        </section>

        {/* Informações de Tela */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Informações da Tela
          </h4>
          <div className="mobile-card bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="mobile-text-sm font-medium">
                Largura da Tela:
              </span>
              <span className="mobile-text-sm">{window.innerWidth}px</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="mobile-text-sm font-medium">
                Altura da Tela:
              </span>
              <span className="mobile-text-sm">{window.innerHeight}px</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="mobile-text-sm font-medium">
                Tipo de Dispositivo:
              </span>
              <span className="mobile-text-sm flex items-center">
                {window.innerWidth < 640 ? (
                  <>
                    <FiSmartphone className="w-4 h-4 mr-1" />
                    Mobile
                  </>
                ) : window.innerWidth < 1024 ? (
                  <>
                    <FiTablet className="w-4 h-4 mr-1" />
                    Tablet
                  </>
                ) : (
                  <>
                    <FiMonitor className="w-4 h-4 mr-1" />
                    Desktop
                  </>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="mobile-text-sm font-medium">
                Densidade de Pixel:
              </span>
              <span className="mobile-text-sm">{window.devicePixelRatio}x</span>
            </div>
          </div>
        </section>

        {/* Testes de Visibilidade */}
        <section>
          <h4 className="mobile-text-base font-semibold mb-3">
            Testes de Visibilidade
          </h4>
          <div className="space-y-2">
            <div className="hide-mobile p-2 bg-blue-50 border border-blue-200 rounded">
              <span className="mobile-text-sm">
                Visível apenas em telas maiores (desktop/tablet)
              </span>
            </div>
            <div className="show-mobile p-2 bg-green-50 border border-green-200 rounded">
              <span className="mobile-text-sm">Visível apenas em mobile</span>
            </div>
            <div className="hide-on-small p-2 bg-purple-50 border border-purple-200 rounded">
              <span className="mobile-text-sm">
                Oculto em telas muito pequenas
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="mobile-card-footer">
        <button
          onClick={() => setIsVisible(false)}
          className="mobile-btn-primary w-full"
        >
          Fechar Teste
        </button>
      </div>
    </div>
  );
}
