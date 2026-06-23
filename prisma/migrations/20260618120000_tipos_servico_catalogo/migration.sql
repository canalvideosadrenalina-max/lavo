-- Add categoria to tipos_servico
ALTER TABLE "tipos_servico" ADD COLUMN IF NOT EXISTS "categoria" TEXT;

UPDATE "tipos_servico" SET "categoria" = 'Outros' WHERE "categoria" IS NULL;

ALTER TABLE "tipos_servico" ALTER COLUMN "categoria" SET NOT NULL;

-- Standard car wash service catalog (insert if slug does not exist)
INSERT INTO "tipos_servico" ("id", "slug", "nome", "categoria", "descricao", "ordem")
VALUES
  (gen_random_uuid()::text, 'lavagem-simples', 'Lavagem Simples', 'LAVAGEM BÁSICA', 'Lavagem exterior do veículo', 1),
  (gen_random_uuid()::text, 'lavagem-completa', 'Lavagem Completa', 'LAVAGEM BÁSICA', 'Lavagem interna e externa do veículo', 2),
  (gen_random_uuid()::text, 'lavagem-a-seco', 'Lavagem a Seco', 'LAVAGEM BÁSICA', 'Limpeza externa sem uso de água', 3),
  (gen_random_uuid()::text, 'lavagem-ecologica-vapor', 'Lavagem Ecológica (vapor)', 'LAVAGEM BÁSICA', 'Lavagem com vapor, baixo consumo de água', 4),

  (gen_random_uuid()::text, 'higienizacao-interna-completa', 'Higienização Interna Completa', 'LIMPEZA INTERNA', 'Limpeza profunda de todo o interior', 5),
  (gen_random_uuid()::text, 'limpeza-estofados-bancos', 'Limpeza de Estofados e Bancos', 'LIMPEZA INTERNA', 'Higienização de bancos e estofados', 6),
  (gen_random_uuid()::text, 'higienizacao-carpetes', 'Higienização de Carpetes', 'LIMPEZA INTERNA', 'Limpeza e higienização dos carpetes', 7),
  (gen_random_uuid()::text, 'limpeza-teto', 'Limpeza de Teto', 'LIMPEZA INTERNA', 'Limpeza do forro interno do veículo', 8),
  (gen_random_uuid()::text, 'sanitizacao-ozonio', 'Sanitização com Ozônio', 'LIMPEZA INTERNA', 'Eliminação de odores e bactérias com ozônio', 9),

  (gen_random_uuid()::text, 'polimento-simples', 'Polimento Simples', 'POLIMENTO E PROTEÇÃO', 'Recuperação do brilho da pintura', 10),
  (gen_random_uuid()::text, 'polimento-cristalizacao', 'Polimento com Cristalização', 'POLIMENTO E PROTEÇÃO', 'Polimento com proteção cristalizada', 11),
  (gen_random_uuid()::text, 'enceramento', 'Enceramento', 'POLIMENTO E PROTEÇÃO', 'Aplicação de cera protetora na pintura', 12),
  (gen_random_uuid()::text, 'vitrificacao-pintura', 'Vitrificação da Pintura', 'POLIMENTO E PROTEÇÃO', 'Proteção cerâmica de longa duração', 13),
  (gen_random_uuid()::text, 'pretinho-pneus-plasticos', 'Pretinho de Pneus e Plásticos', 'POLIMENTO E PROTEÇÃO', 'Revitalização de pneus e plásticos externos', 14),

  (gen_random_uuid()::text, 'lavagem-motor', 'Lavagem de Motor', 'MOTOR E CHASSI', 'Limpeza e desengorduramento do motor', 15),
  (gen_random_uuid()::text, 'lavagem-chassi', 'Lavagem de Chassi', 'MOTOR E CHASSI', 'Limpeza da parte inferior do veículo', 16),

  (gen_random_uuid()::text, 'limpeza-vidros', 'Limpeza de Vidros', 'VIDROS', 'Limpeza interna e externa dos vidros', 17),
  (gen_random_uuid()::text, 'repelente-agua', 'Repelente de Água', 'VIDROS', 'Tratamento hidrofóbico para vidros', 18),

  (gen_random_uuid()::text, 'revitalizacao-farois', 'Revitalização de Faróis', 'SERVIÇOS ESPECIAIS', 'Recuperação da transparência dos faróis', 19),
  (gen_random_uuid()::text, 'higienizacao-ar-condicionado', 'Higienização de Ar-Condicionado', 'SERVIÇOS ESPECIAIS', 'Limpeza e desinfecção do sistema de ar', 20),
  (gen_random_uuid()::text, 'impermeabilizacao-estofados', 'Impermeabilização de Estofados', 'SERVIÇOS ESPECIAIS', 'Proteção contra líquidos em estofados', 21),
  (gen_random_uuid()::text, 'nano-ceramica', 'Nano Cerâmica', 'SERVIÇOS ESPECIAIS', 'Revestimento nano cerâmico de alta proteção', 22)
ON CONFLICT ("slug") DO NOTHING;
