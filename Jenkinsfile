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
            dir('backend') {
                sh 'docker build -t tracklify-backend .'
            }
        }
    }

    stage('Stop Old Container') {
        steps {
            sh '''
            docker stop tracklify-backend || true
            docker rm tracklify-backend || true
            '''
        }
    }

    stage('Deploy Container') {
        steps {
            sh '''
            docker run -d \
            --name tracklify-backend \
            -p 5000:5000 \
            tracklify-backend
            '''
        }
    }
}

post {
    success {
        echo 'Deployment Successful'
    }

    failure {
        echo 'Deployment Failed'
    }
}


}
