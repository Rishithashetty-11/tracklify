pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t tracklify .'
            }
        }

        stage('Stop Old Container') {
            steps {
                sh 'docker stop tracklify || true'
                sh 'docker rm tracklify || true'
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker run -d \
                --name tracklify \
                -p 3000:3000 \
                tracklify
                '''
            }
        }
    }
}
