pipeline {
    agent any

    stages {
        stage('Frontend Checks & Build') {
            steps {
                sh 'npm ci'
                sh 'npm run lint'
                sh 'npx --yes tsx --test src/utils/billing.test.ts src/utils/datasets.test.ts src/services/api.test.ts'
                sh 'npm run build'
            }
        }
        stage('Backend Spring Boot & JaCoCo Verify') {
            steps {
                dir('backend') {
                    sh 'mvn verify -B'
                }
            }
        }
    }
    post {
        always {
            archiveArtifacts artifacts: 'backend/target/site/jacoco/**/*', allowEmpty: true
        }
    }
}
